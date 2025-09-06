import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

// Validate environment variables
const validateEnvVars = () => {
    const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
    
    console.log('🔧 Environment variables check:');
    console.log('Endpoint:', endpoint);
    console.log('Project ID:', projectId);
    
    if (!endpoint) {
        throw new Error('EXPO_PUBLIC_APPWRITE_ENDPOINT is not defined in environment variables');
    }
    
    if (!projectId) {
        throw new Error('EXPO_PUBLIC_APPWRITE_PROJECT_ID is not defined in environment variables');
    }
    
    return { endpoint, projectId };
};

const { endpoint, projectId } = validateEnvVars();

export const appwriteConfig = {
    endpoint,
    platform: "com.jsm.foodordering",
    projectId,
    databaseId: '68a5b4b30027ed55524e',
    bucketId:'68ac0fb6001d3f84a83c',
    userCollectionId: '68a5b55a002563310afe',
    categoriesCollectionId:'68ac0a5a0013de52a0ea',
    menuCollectionId:'68ac0b7b0024fa6f11a9',
    customizationsCollectionId:'68ac0d100029291415eb',
    menuCustomizationsCollectionId:'68ac0e7b002064aa6f53',
}

console.log('🚀 Initializing Appwrite client with config:', {
    endpoint: appwriteConfig.endpoint,
    projectId: appwriteConfig.projectId,
    platform: appwriteConfig.platform
});

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {

    try {
        const newAccount = await account.create(ID.unique(), email, password, name);
        if (!newAccount) throw Error

        await signIn({ email, password });

        const avatarUrl=avatars.getInitialsURL(name);

       return await databases.createDocument(
              appwriteConfig.databaseId,
              appwriteConfig.userCollectionId,
              ID.unique(),
              { email,name,accountId:newAccount.$id,avatar:avatarUrl}            
        );
        
    } catch (e) {
        console.error('Error creating user:', e);
        throw new Error(e as string)
    }
}

export const signIn=async({email,password}:SignInParams)=>{
try {
    const session=await account.createEmailPasswordSession(email,password)   
} catch (e) {
    console.error('Error signing in:', e);
    throw new Error(e as string)
}
}

export const getCurrentUser=async()=>{
    try {
        const currentAccount=await account.get();
        if(!currentAccount) {
            console.log('No current account found');
            return null;
        }

        const currentUser=await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )
        
        if(!currentUser || !currentUser.documents || currentUser.documents.length === 0) {
            console.log('No user document found');
            return null;
        }
        
        return currentUser.documents[0];
    } catch (e) {
        console.log('getCurrentUser error:', e);
        return null;
    }
}

// Add a function to test the connection
export const testConnection = async () => {
    try {
        console.log('🔍 Testing connection to Appwrite...');
        console.log('Database ID:', appwriteConfig.databaseId);
        console.log('Categories Collection ID:', appwriteConfig.categoriesCollectionId);
        
        // Try to list documents from a collection to test the connection
        const result = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            []
        );
        
        console.log('✅ Appwrite connection successful');
        console.log('Found documents:', result.documents.length);
        return true;
    } catch (error) {
        console.error('❌ Appwrite connection failed:', error);
        console.error('Error details:', {
            message: (error as any).message,
            code: (error as any).code,
            response: (error as any).response
        });
        throw error;
    }
};

export const getMenu=async({category,query}:GetMenuParams)=>{
    try {
        const queries:string[]=[];
        if(category)queries.push(Query.equal('categories',category));
        if(query) queries.push(Query.search('name',query));

        const menus=await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )
        return menus.documents
    } catch (e) {
        throw new Error(e as string)
    }
}

export const getCategories=async()=>{
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )
        return categories.documents
    } catch (e) {
        throw new Error(e as string)
    }
}