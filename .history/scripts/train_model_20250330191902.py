import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout

# ✅ Correct Dataset Paths
BASE_DIR = "/Users/ragulbalajee/content-moderation-project/dataset/AdultContent"
TRAIN_DIR = os.path.join(BASE_DIR, "train")  
VAL_DIR = os.path.join(BASE_DIR, "val")      

# ✅ Check if directories exist
if not os.path.exists(TRAIN_DIR) or not os.path.exists(VAL_DIR):
    raise FileNotFoundError(f"❌ Dataset folders not found! Check the paths:\n{TRAIN_DIR}\n{VAL_DIR}")

# ✅ Data Preprocessing
train_datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=30,
    horizontal_flip=True,
    zoom_range=0.2,
    shear_range=0.2
)
val_datagen = ImageDataGenerator(rescale=1.0/255)

train_dataset = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(224, 224),
    batch_size=32,
    class_mode='binary'  # Change to 'categorical' if more than 2 classes
)

val_dataset = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=(224, 224),
    batch_size=32,
    class_mode='binary'
)

# ✅ Define a Better CNN Model
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(224, 224, 3)),
    MaxPooling2D(2,2),
    
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    
    Conv2D(128, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    
    Flatten(),
    Dense(256, activation='relu'),
    Dropout(0.5),  # Prevent overfitting
    Dense(1, activation='sigmoid')  # Change to softmax if multi-class
])

# ✅ Compile the Model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# ✅ Train the Model
EPOCHS = 10
model.fit(train_dataset, validation_data=val_dataset, epochs=EPOCHS)

# ✅ Save the Model
model.save("content_moderation_model.h5")
print("✅ Model training complete! Saved as 'content_moderation_model.h5'")
