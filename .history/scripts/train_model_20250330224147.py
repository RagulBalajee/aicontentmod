import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import os
from PIL import Image
import numpy as np

# Ensure TensorFlow uses GPU (if available)
physical_devices = tf.config.experimental.list_physical_devices('GPU')
if physical_devices:
    tf.config.experimental.set_memory_growth(physical_devices[0], True)

# Set dataset directories
train_dir = "path_to_train_dataset"
val_dir = "path_to_validation_dataset"
image_size = (224, 224)
batch_size = 32

# Function to check if an image is valid
def is_valid_image(filepath):
    try:
        img = Image.open(filepath)
        img.verify()  # Verify if it's corrupted
        return True
    except (IOError, SyntaxError):
        print(f"Corrupted image detected: {filepath}")
        return False

# Load and filter valid images
def get_valid_images(directory):
    all_files = [os.path.join(directory, fname) for fname in os.listdir(directory)]
    return [f for f in all_files if is_valid_image(f)]

# Use `image_dataset_from_directory` with validation checks
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    train_dir,
    image_size=image_size,
    batch_size=batch_size,
    label_mode="binary"
)

val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    val_dir,
    image_size=image_size,
    batch_size=batch_size,
    label_mode="binary"
)

# Data Augmentation
data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.2),
])

# Build Model
model = keras.Sequential([
    layers.Input(shape=(224, 224, 3)),  # Use Input layer instead of `input_shape`
    data_augmentation,
    layers.Rescaling(1./255),
    layers.Conv2D(32, (3, 3), activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(1, activation='sigmoid')  # Binary classification
])

# Compile Model
model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

# Train Model
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=10
)

# Save the model
model.save("content_moderation_model.h5")

print("Training complete. Model saved.")
