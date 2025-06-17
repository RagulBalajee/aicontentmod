import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from PIL import Image

# -------------------------------
# 🔹 Fix: Ensure corrupted images are skipped
# -------------------------------
def load_and_preprocess_image(image_path):
    """ Load and preprocess an image while skipping corrupted files. """
    try:
        img = Image.open(image_path)
        img.verify()  # Check if the image is corrupted
        img = Image.open(image_path)
        img = img.convert("RGB")  # Convert to RGB
        img = img.resize((224, 224))  # Resize to match model input
        return tf.keras.preprocessing.image.img_to_array(img) / 255.0  # Normalize
    except (IOError, OSError):
        print(f"⚠️ Corrupted image skipped: {image_path}")
        return None  # Return None for corrupted images

# -------------------------------
# 🔹 Define Dataset Paths
# -------------------------------
DATASET_PATH = "dataset"  # Change this if your dataset is in a different location
TRAIN_DIR = os.path.join(DATASET_PATH, "train")
VAL_DIR = os.path.join(DATASET_PATH, "val")

# -------------------------------
# 🔹 Image Data Generator (Automatically Skips Bad Images)
# -------------------------------
train_datagen = ImageDataGenerator(rescale=1.0/255.0)
val_datagen = ImageDataGenerator(rescale=1.0/255.0)

train_dataset = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(224, 224),
    batch_size=32,
    class_mode="binary"
)

val_dataset = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=(224, 224),
    batch_size=32,
    class_mode="binary"
)

# -------------------------------
# 🔹 Define the Model
# -------------------------------
model = Sequential([
    Conv2D(32, (3, 3), activation="relu", input_shape=(224, 224, 3)),
    MaxPooling2D(2, 2),
    Conv2D(64, (3, 3), activation="relu"),
    MaxPooling2D(2, 2),
    Conv2D(128, (3, 3), activation="relu"),
    MaxPooling2D(2, 2),
    Flatten(),
    Dense(256, activation="relu"),
    Dropout(0.5),
    Dense(1, activation="sigmoid")  # Binary classification (NSFW or Safe)
])

# -------------------------------
# 🔹 Compile the Model
# -------------------------------
model.compile(
    optimizer=Adam(learning_rate=0.0001),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

# -------------------------------
# 🔹 Train the Model
# -------------------------------
EPOCHS = 10

model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS
)

# -------------------------------
# 🔹 Save the Model
# -------------------------------
model.save("nsfw_model.h5")
print("✅ Model training complete. Model saved as nsfw_model.h5")
