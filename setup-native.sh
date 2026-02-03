#!/bin/bash

# Native Platform Setup Script
# Generates iOS and Android folders from React Native template

echo "🚀 LearnTracker - Native Platform Setup"
echo "========================================"
echo ""

# Check if ios/android already exist
if [ -d "ios" ] && [ -d "android" ]; then
    echo "✅ Native folders already exist (ios/ and android/)"
    echo "   If you want to regenerate them, delete them first:"
    echo "   rm -rf ios android"
    exit 0
fi

# Create temporary project
echo "📦 Step 1: Creating temporary React Native project..."
cd ..
npx react-native@latest init TempLearnTracker --template react-native-template-typescript --skip-install

if [ ! -d "TempLearnTracker" ]; then
    echo "❌ Failed to create temporary project"
    exit 1
fi

echo "✅ Temporary project created"
echo ""

# Copy native folders
echo "📁 Step 2: Copying native folders to BrainLog..."
cp -r TempLearnTracker/ios BrainLog/
cp -r TempLearnTracker/android BrainLog/
cp TempLearnTracker/.watchmanconfig BrainLog/ 2>/dev/null || true

# Clean up
echo "🧹 Step 3: Cleaning up temporary files..."
rm -rf TempLearnTracker

cd BrainLog

echo "✅ Native folders copied successfully!"
echo ""

# Update package name in Android
echo "🔧 Step 4: Updating Android package name..."
if [ -d "android/app" ]; then
    # Update build.gradle
    sed -i '' 's/namespace "com.templearntracker"/namespace "com.learntracker.app"/' android/app/build.gradle 2>/dev/null || \
    sed -i 's/namespace "com.templearntracker"/namespace "com.learntracker.app"/' android/app/build.gradle 2>/dev/null

    sed -i '' 's/applicationId "com.templearntracker"/applicationId "com.learntracker.app"/' android/app/build.gradle 2>/dev/null || \
    sed -i 's/applicationId "com.templearntracker"/applicationId "com.learntracker.app"/' android/app/build.gradle 2>/dev/null

    echo "✅ Android package name updated"
fi

# Update bundle ID in iOS
echo "🔧 Step 5: Updating iOS bundle identifier..."
if [ -d "ios" ]; then
    find ios -name "*.pbxproj" -exec sed -i '' 's/org.reactjs.native.example.TempLearnTracker/com.learntracker.app/' {} \; 2>/dev/null || \
    find ios -name "*.pbxproj" -exec sed -i 's/org.reactjs.native.example.TempLearnTracker/com.learntracker.app/' {} \; 2>/dev/null

    echo "✅ iOS bundle identifier updated"
fi

echo ""
echo "🎉 Native setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. (macOS) cd ios && pod install && cd .."
echo "   2. Create Firebase project and add config files"
echo "   3. Setup Google OAuth credentials"
echo "   4. Create .env file with your credentials"
echo "   5. Run: npm run ios  OR  npm run android"
echo ""
echo "📖 See NATIVE_SETUP.md for detailed instructions"
