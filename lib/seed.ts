import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage, testConnection } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// Configuration options
const SEED_CONFIG = {
    ENABLE_IMAGE_UPLOADS: false, // Set to true to enable image uploads (may cause network issues)
    USE_LOCAL_FALLBACKS: true,   // Use local images as fallbacks when external uploads fail
    RETRY_ATTEMPTS: 3,           // Number of retry attempts for network operations
    RETRY_DELAY: 1000,           // Initial delay between retries (ms)
};

// ensure dummyData has correct shape
const data = dummyData as DummyData;

// Local image fallbacks for when external images fail
const localImageFallbacks = {
    'Classic Cheeseburger': require('../assets/images/burger-one.png'),
    'Pepperoni Pizza': require('../assets/images/pizza-one.png'),
    'Bean Burrito': require('../assets/images/buritto.png'),
    'BBQ Bacon Burger': require('../assets/images/burger-two.png'),
    'Chicken Caesar Wrap': require('../assets/images/burger-one.png'), // Using burger as fallback
    'Grilled Veggie Sandwich': require('../assets/images/burger-two.png'), // Using burger as fallback
    'Double Patty Burger': require('../assets/images/burger-one.png'),
    'Paneer Tikka Wrap': require('../assets/images/burger-two.png'), // Using burger as fallback
    'Mexican Burrito Bowl': require('../assets/images/buritto.png'),
    'Spicy Chicken Sandwich': require('../assets/images/burger-one.png'),
    'Classic Margherita Pizza': require('../assets/images/pizza-one.png'),
    'Protein Power Bowl': require('../assets/images/burger-two.png'), // Using burger as fallback
    'Paneer Burrito': require('../assets/images/buritto.png'),
    'Chicken Club Sandwich': require('../assets/images/burger-one.png'),
};

// Retry mechanism for network operations
const retryOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = SEED_CONFIG.RETRY_ATTEMPTS,
    delay: number = SEED_CONFIG.RETRY_DELAY
): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed:`, error);
            
            if (attempt < maxRetries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }
    
    throw lastError;
};

async function clearAll(collectionId: string): Promise<void> {
    try {
        const list = await retryOperation(() => 
            databases.listDocuments(
                appwriteConfig.databaseId,
                collectionId
            )
        );

        await Promise.all(
            list.documents.map((doc) =>
                retryOperation(() => 
                    databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
                )
            )
        );
    } catch (error) {
        console.warn(`Warning: Could not clear collection ${collectionId}:`, error);
    }
}

async function clearStorage(): Promise<void> {
    try {
        const list = await retryOperation(() => 
            storage.listFiles(appwriteConfig.bucketId)
        );

        await Promise.all(
            list.files.map((file) =>
                retryOperation(() => 
                    storage.deleteFile(appwriteConfig.bucketId, file.$id)
                )
            )
        );
    } catch (error) {
        console.warn('Warning: Could not clear storage:', error);
    }
}

async function uploadImageToStorage(imageUrl: string, itemName?: string): Promise<string> {
    try {
        console.log(`Attempting to upload image: ${imageUrl}`);
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(imageUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AppwriteBot/1.0)',
                'Accept': 'image/*'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        if (blob.size === 0) {
            throw new Error('Image blob is empty');
        }

        const fileObj = {
            name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
            type: blob.type || 'image/jpeg',
            size: blob.size,
            uri: imageUrl,
        };

        console.log(`Creating file in storage: ${fileObj.name}`);
        const file = await retryOperation(() => 
            storage.createFile(
                appwriteConfig.bucketId,
                ID.unique(),
                fileObj
            )
        );

        const fileUrl = storage.getFileViewURL(appwriteConfig.bucketId, file.$id).toString();
        console.log(`Successfully uploaded image: ${fileUrl}`);
        return fileUrl;
        
    } catch (error) {
        console.warn(`Warning: Failed to upload image ${imageUrl}:`, error);
        
        // If we have a local fallback for this item and it's enabled, use it
        if (SEED_CONFIG.USE_LOCAL_FALLBACKS && itemName && localImageFallbacks[itemName as keyof typeof localImageFallbacks]) {
            console.log(`Using local fallback image for: ${itemName}`);
            try {
                const localImage = localImageFallbacks[itemName as keyof typeof localImageFallbacks];
                const fileObj = {
                    name: `${itemName.toLowerCase().replace(/\s+/g, '-')}.png`,
                    type: 'image/png',
                    size: 0, // Will be set by the storage service
                    uri: localImage,
                };

                const file = await retryOperation(() => 
                    storage.createFile(
                        appwriteConfig.bucketId,
                        ID.unique(),
                        fileObj
                    )
                );

                const fileUrl = storage.getFileViewURL(appwriteConfig.bucketId, file.$id).toString();
                console.log(`Successfully uploaded local fallback image: ${fileUrl}`);
                return fileUrl;
            } catch (localError) {
                console.warn(`Failed to upload local fallback for ${itemName}:`, localError);
            }
        }
        
        console.log(`Using original image URL as fallback for: ${imageUrl}`);
        // Return the original URL as final fallback
        return imageUrl;
    }
}

async function seed(): Promise<void> {
    try {
        console.log('🔍 Testing Appwrite connection...');
        await testConnection();
        
        console.log('🧹 Clearing existing data...');
        // 1. Clear all
        await clearAll(appwriteConfig.categoriesCollectionId);
        await clearAll(appwriteConfig.customizationsCollectionId);
        await clearAll(appwriteConfig.menuCollectionId);
        await clearAll(appwriteConfig.menuCustomizationsCollectionId);
        await clearStorage();

        console.log('📂 Creating categories...');
        // 2. Create Categories
        const categoryMap: Record<string, string> = {};
        for (const cat of data.categories) {
            try {
                const doc = await retryOperation(() => 
                    databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.categoriesCollectionId,
                        ID.unique(),
                        cat
                    )
                );
                categoryMap[cat.name] = doc.$id;
            } catch (error) {
                console.error(`Error creating category ${cat.name}:`, error);
                throw error;
            }
        }

        console.log('⚙️ Creating customizations...');
        // 3. Create Customizations
        const customizationMap: Record<string, string> = {};
        for (const cus of data.customizations) {
            try {
                const doc = await retryOperation(() => 
                    databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.customizationsCollectionId,
                        ID.unique(),
                        {
                            name: cus.name,
                            price: cus.price,
                            type: cus.type,
                        }
                    )
                );
                customizationMap[cus.name] = doc.$id;
            } catch (error) {
                console.error(`Error creating customization ${cus.name}:`, error);
                throw error;
            }
        }

        console.log('🍔 Creating menu items...');
        // 4. Create Menu Items - Skip image uploads for now to avoid network issues
        const menuMap: Record<string, string> = {};
        for (const item of data.menu) {
            try {
                console.log(`Processing menu item: ${item.name}`);
                
                // Handle image upload based on configuration
                let finalImageUrl = item.image_url;
                if (SEED_CONFIG.ENABLE_IMAGE_UPLOADS) {
                    try {
                        console.log(`Uploading image for ${item.name}...`);
                        finalImageUrl = await uploadImageToStorage(item.image_url, item.name);
                    } catch (imageError) {
                        console.warn(`Image upload failed for ${item.name}, using original URL:`, imageError);
                        finalImageUrl = item.image_url;
                    }
                } else {
                    console.log(`Using original image URL for ${item.name}: ${item.image_url}`);
                }

                console.log(`Creating menu item document for ${item.name}...`);
                const doc = await retryOperation(() => 
                    databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.menuCollectionId,
                        ID.unique(),
                        {
                            name: item.name,
                            description: item.description,
                            image_url: finalImageUrl,
                            price: item.price,
                            rating: item.rating,
                            calories: item.calories,
                            protein: item.protein,
                            categories: categoryMap[item.category_name],
                        }
                    )
                );

                menuMap[item.name] = doc.$id;
                console.log(`Successfully created menu item: ${item.name}`);

                console.log(`Creating customizations for ${item.name}...`);
                // 5. Create menu_customizations
                let customizationSuccessCount = 0;
                for (const cusName of item.customizations) {
                    try {
                        await retryOperation(() => 
                            databases.createDocument(
                                appwriteConfig.databaseId,
                                appwriteConfig.menuCustomizationsCollectionId,
                                ID.unique(),
                                {
                                    menu: doc.$id,
                                    customizations: customizationMap[cusName],
                                }
                            )
                        );
                        customizationSuccessCount++;
                    } catch (error) {
                        console.error(`Error creating menu customization for ${item.name} - ${cusName}:`, error);
                        // Continue with other customizations
                    }
                }
                console.log(`Created ${customizationSuccessCount}/${item.customizations.length} customizations for ${item.name}`);
                
            } catch (error) {
                console.error(`Error creating menu item ${item.name}:`, error);
                // Continue with other menu items instead of stopping the entire process
                console.log(`Skipping menu item ${item.name} and continuing with others...`);
            }
        }

        console.log("✅ Seeding complete.");
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

export default seed;