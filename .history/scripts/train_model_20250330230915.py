import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from PIL import Image

# ✅ Set Dataset Paths
DATASET_PATH = "/Users/ragulbalajee/content-moderation-project/dataset"  # Change this to your actual dataset path
IMG_SIZE = (224, 224)  # Standard image size
BATCH_SIZE = 32
EPOCHS = 10

# ✅ Function to Remove Corrupt Images
def remove_corrupt_images(directory):
    corrupt_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with Image.open(file_path) as img:
                    img.verify()  # Check if it's a valid image
            except Exception as e:
                print(f"❌ Corrupt image found: {file_path} ({e})")
                corrupt_files.append(file_path)

    # Remove corrupted files
    for file in corrupt_files:
        os.remove(file)
        print(f"🗑️ Removed: {file}")

# ✅ Clean the dataset before training
remove_corrupt_images(DATASET_PATH)

# ✅ Load the Dataset
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

# ✅ Normalize the Images
normalization_layer = layers.Rescaling(1./255)
train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

# ✅ Define the CNN Model
model = keras.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    layers.MaxPooling2D(2, 2),

    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D(2, 2),

    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D(2, 2),

    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(2, activation='softmax')  # 2 classes (safe & unsafe)
])

# ✅ Compile the Model
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# ✅ Train the Model
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS
)

# ✅ Save the Model
model.save("content_moderation_model.h5")
print("🎉 Model training complete and saved as 'content_moderation_model.h5'!")
