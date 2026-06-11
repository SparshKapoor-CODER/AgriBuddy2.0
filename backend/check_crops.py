# check_crops.py
import pickle
import os

print("=" * 60)
print("🔍 Checking Supported Crops for AgriBuddy")
print("=" * 60)

# Check current directory
print(f"\n📁 Current directory: {os.getcwd()}")

# Check if models folder exists
models_path = "models"
if os.path.exists(models_path):
    print(f"✅ Models folder found")
    print(f"Files in models folder: {os.listdir(models_path)}")
else:
    print(f"❌ Models folder not found at: {models_path}")
    exit()

# Load the crop label encoder
crop_encoder_path = os.path.join(models_path, "le_crop.pkl")

if not os.path.exists(crop_encoder_path):
    print(f"❌ le_crop.pkl not found at: {crop_encoder_path}")
    exit()

try:
    with open(crop_encoder_path, 'rb') as f:
        le_crop = pickle.load(f)
    
    # Get all crop classes
    if hasattr(le_crop, 'classes_'):
        crop_classes = le_crop.classes_.tolist()
    else:
        crop_classes = list(le_crop)
    
    print(f"\n✅ Successfully loaded le_crop.pkl")
    print("\n" + "=" * 60)
    print(f"📊 TOTAL CROPS SUPPORTED: {len(crop_classes)}")
    print("=" * 60)
    print("\n🌾 LIST OF CROPS:")
    print("-" * 40)
    
    for i, crop in enumerate(crop_classes, 1):
        print(f"{i:3}. {crop}")
    
    print("=" * 60)
    
    # Save to file
    with open("supported_crops.txt", "w") as f:
        f.write(f"Total crops supported: {len(crop_classes)}\n")
        f.write("=" * 40 + "\n\n")
        for crop in crop_classes:
            f.write(f"{crop}\n")
    
    print(f"\n💾 List saved to: supported_crops.txt")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
