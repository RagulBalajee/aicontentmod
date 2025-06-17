import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import os

# Paths to datasets
adult_data_dir = "../dataset/AdultContent"
violence_data_dir = "../dataset/ViolenceContent"

# Image properties
IMG_SIZE = 224
BATCH_SIZE = 32

# Data Augmentation & Preprocessing
datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

# Load Adult Content Dataset
train_adult = datagen.flow_from_directory(adult_data_dir, target_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH_SIZE, class_mode='binary', subset='training')
val_adult = datagen.flow_from_directory(adult_data_dir, target_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH_SIZE, class_mode='binary', subset='validation')

# Load Violence Dataset
train_violence = datagen.flow_from_directory(violence_data_dir, target_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH_SIZE, class_mode='binary', subset='training')
val_violence = datagen.flow_from_directory(violence_data_dir, target_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH_SIZE, class_mode='binary', subset='validation')

# Combine datasets
train_dataset = train_adult
val_dataset = val_adult

# Model Architecture
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
    MaxPooling2D(2,2),
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    Conv2D(128, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    Flatten(),
    Dense(512, activation='relu'),
    Dropout(0.5),
    Dense(1, activation='sigmoid')  # Binary Classification (Safe / NSFW-Violence)
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
EPOCHS = 10
model.fit(train_dataset, validation_data=val_dataset, epochs=EPOCHS)

# Save the model
model.save("../model/nsfw_model.h5")
print("✅ Model trained and saved successfully!")
