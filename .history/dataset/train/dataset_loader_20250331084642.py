import os
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Define dataset path
DATASET_PATH = "content_moderation/data/raw/"

# Transformations (resize, normalize, etc.)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

# Load dataset
def load_dataset():
    dataset = datasets.ImageFolder(root=DATASET_PATH, transform=transform)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
    return dataloader

# Test loading
if __name__ == "__main__":
    dataloader = load_dataset()
    print(f"Loaded {len(dataloader.dataset)} images.")
