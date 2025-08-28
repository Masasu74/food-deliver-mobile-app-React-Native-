import { appwriteConfig, testConnection } from './appwrite';

export const debugAppwriteConfig = () => {
    console.log('🔍 Debugging Appwrite Configuration:');
    console.log('=====================================');
    console.log('Endpoint:', appwriteConfig.endpoint);
    console.log('Project ID:', appwriteConfig.projectId);
    console.log('Platform:', appwriteConfig.platform);
    console.log('Database ID:', appwriteConfig.databaseId);
    console.log('Bucket ID:', appwriteConfig.bucketId);
    console.log('Collections:');
    console.log('  - Users:', appwriteConfig.userCollectionId);
    console.log('  - Categories:', appwriteConfig.categoriesCollectionId);
    console.log('  - Menu:', appwriteConfig.menuCollectionId);
    console.log('  - Customizations:', appwriteConfig.customizationsCollectionId);
    console.log('  - Menu Customizations:', appwriteConfig.menuCustomizationsCollectionId);
    console.log('=====================================');
};

export const testNetworkConnectivity = async () => {
    console.log('🌐 Testing network connectivity...');
    
    try {
        // Test basic internet connectivity
        const response = await fetch('https://httpbin.org/get');
        if (response.ok) {
            console.log('✅ Basic internet connectivity: OK');
        } else {
            console.log('❌ Basic internet connectivity: Failed');
        }
    } catch (error) {
        console.log('❌ Basic internet connectivity: Failed', error);
    }
    
    try {
        // Test Appwrite endpoint connectivity
        const response = await fetch(appwriteConfig.endpoint);
        if (response.ok) {
            console.log('✅ Appwrite endpoint connectivity: OK');
        } else {
            console.log('❌ Appwrite endpoint connectivity: Failed');
        }
    } catch (error) {
        console.log('❌ Appwrite endpoint connectivity: Failed', error);
    }
};

export const runFullDiagnostic = async () => {
    console.log('🚀 Running full diagnostic...');
    
    debugAppwriteConfig();
    await testNetworkConnectivity();
    
    try {
        await testConnection();
        console.log('✅ Full diagnostic: All tests passed');
    } catch (error) {
        console.log('❌ Full diagnostic: Connection test failed', error);
    }
};


