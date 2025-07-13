

# Import required libraries
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
import torch
from datasets import Dataset
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# Load dataset
df = pd.read_csv("sample_posts.csv")

# Preview dataset
df.head()

# Balance dataset (equal number of suicide & non-suicide posts)
suicide = df[df['class'] == 'suicide'].head(30000)
non_suicide = df[df['class'] == 'non-suicide'].head(30000)
df_balanced = pd.concat([suicide, non_suicide]).reset_index(drop=True)

# Encode labels (suicide = 1, non-suicide = 0)
label_map = {'suicide': 1, 'non-suicide': 0}
df_balanced['label'] = df_balanced['class'].map(label_map)

# Convert to Hugging Face dataset format
dataset = Dataset.from_pandas(df_balanced[['text', 'label']])

# Use RoBERTa tokenizer
model_name = "roberta-base"  # Standard RoBERTa model
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Tokenization function
def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

# Apply tokenization
tokenized_datasets = dataset.map(tokenize_function, batched=True)

# Use only 50% of training data for faster debugging (remove this later for full dataset)
train_test_split = tokenized_datasets.train_test_split(test_size=0.2, train_size=0.5, seed=42)

# Define train & test datasets
train_dataset = train_test_split["train"]
test_dataset = train_test_split["test"]

# Load pre-trained RoBERTa model for binary classification
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

# Define custom evaluation function
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average="binary")
    acc = accuracy_score(labels, preds)
    return {"accuracy": acc, "f1": f1, "precision": precision, "recall": recall}

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    warmup_steps=10,
    weight_decay=0.01,
    logging_dir="./logs"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=compute_metrics
)

# Start training
trainer.train()


model.save_pretrained("roberta-model")
tokenizer.save_pretrained("roberta-model")


# Evaluate on test set
results = trainer.evaluate()
print("Optimized RoBERTa Evaluation Results:", results)

# Example texts for classification
test_texts = ["I just can't take it anymore. It feels like everything is falling apart, and no matter how hard I try, I can't fix it. I'm exhausted, emotionally and physically, and the idea of waking up to another day of pain feels unbearable. I feel like the world would be better off without me, and maybe it would be easier if I just disappeared.", "Everything feels hopeless, like I'm stuck in a dark hole with no way out. I’ve been pretending to be okay for so long, but inside, I feel empty. The pain is overwhelming, and I don't know how much longer I can keep going. It feels like no one would even notice if I disappeared. Maybe it's better if I just stop fighting."]
test_encodings = tokenizer(test_texts, padding=True, truncation=True, return_tensors="pt")

# Move test_encodings to the same device as the model
if torch.cuda.is_available():
    device = torch.device("cuda")
    test_encodings = test_encodings.to(device)
else:
    device = torch.device("cpu")

# Predict
outputs = model(**test_encodings)
predictions = torch.argmax(outputs.logits, dim=1)

# Print predictions (1 = suicide, 0 = non-suicide)
print("Predictions:", predictions.tolist())