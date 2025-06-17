import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import numpy as np
from PIL import Image

# ✅ Define dataset path dynamically
BASE_DIR = os.path.abspath("/Users/ragulbalajee/content-moderation-project/dataset/AdultContent")
TRAIN_DIR = os.path.join(BASE_DIR, "train")
VAL_DIR = os.path.join(BASE_DIR, "val")

# ✅ Check if dataset exists
if not os.path.exists(TRAIN_DIR) or not os.path.exists(VAL_DIR):
    raise FileNotFoundError(f"❌ Dataset folders not found! Check paths:\n{TRAIN_DIR}\n{VAL_DIR}")

# ✅ Image Parameters
IMG_SIZE = (224, 224)  # Match your model input
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.0001

# ✅ Preprocessing: Augment & Normalize Images
train_datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

val_datagen = ImageDataGenerator(rescale=1.0/255)

# ✅ Create Data Loaders
train_dataset = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary"  # Change to 'categorical' if you have 3+ classes
)

val_dataset = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary"
)

# ✅ Fix Corrupt Images: Remove Broken Files
def check_images(directory):
    for folder in ["train", "val"]:
        folder_path = os.path.join(directory, folder)
        for class_folder in os.listdir(folder_path):
            class_path = os.path.join(folder_path, class_folder)
            for img_name in os.listdir(class_path):
                img_path = os.path.join(class_path, img_name)
                try:
                    img = Image.open(img_path)  # Open image
                    img.verify()  # Check integrity
                except (IOError, OSError):
                    print(f"❌ Corrupt Image Removed: {img_path}")
                    os.remove(img_path)

check_images(BASE_DIR)

# ✅ Model Architecture
model = Sequential([
    Conv2D(32, (3, 3), activation="relu", input_shape=(224, 224, 3)),
    MaxPooling2D(2, 2),
    
    Conv2D(64, (3, 3), activation="relu"),
    MaxPooling2D(2, 2),

    Conv2D(128, (3, 3), activation="relu"),
    MaxPooling2D(2, 2),

    Flatten(),
    Dense(128, activation="relu"),
    Dropout(0.5),
    Dense(1, activation="sigmoid")  # Binary classification
])

# ✅ Compile Model
model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

# ✅ Train Model
history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS
)

# ✅ Save Model
model.save("nsfw_model.h5")
print("✅ Model training complete. Saved as 'nsfw_model.h5'!")
