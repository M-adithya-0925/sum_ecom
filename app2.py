from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import joblib
import os
from datetime import timedelta
import matplotlib.pyplot as plt
import io
import base64
import tensorflow as tf
from PIL import Image
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import load_model
import logging

app = Flask(__name__)

# Load the plant identification model
plant_model = load_model('plant_model_1.h5')

# Define paths
base_model_path = 'model_vit'
base_excel_path = 'Rand_vit'

# Product data
products = [
    {'id': 1, 'name': 'Vitamin C Serum', 'category': 'Skincare_Products', 'price': 29.99},
    {'id': 2, 'name': 'Neem Facewash Powder', 'category': 'Skincare_Products', 'price': 14.99},
    {'id': 3, 'name': 'Aloe Vera Sunscreen', 'category': 'Skincare_Products', 'price': 19.99},
    {'id': 4, 'name': 'Ragi', 'category': 'Organic_Food_Products', 'price': 9.99},
    {'id': 5, 'name': 'Kambu', 'category': 'Organic_Food_Products', 'price': 8.99},
    {'id': 6, 'name': 'ABC Juice Powder', 'category': 'Organic_Food_Products', 'price': 24.99},
    {'id': 7, 'name': 'Fenugreek Powder', 'category': 'Organic_Medicinal_Products', 'price': 12.99},
    {'id': 8, 'name': 'Nilevembu Powder', 'category': 'Organic_Medicinal_Products', 'price': 15.99},
    {'id': 9, 'name': 'Papaya Leaf Powder', 'category': 'Organic_Medicinal_Products', 'price': 17.99}
]

@app.errorhandler(Exception)
def handle_exception(e):
    logging.error(f"Unhandled exception: {str(e)}")
    return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/predict', methods=['POST'])
def predict():
    product_name = request.form.get('product_name')
    if not product_name:
        return jsonify({"error": "Product name is required"}), 400

    product = next((p for p in products if p['name'] == product_name), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    category = product['category']
    model_file = os.path.join(base_model_path, category, f'{product_name.replace(" ", "_")}_model.pkl')
    excel_file_path = os.path.join(base_excel_path, category, f'{product_name.replace(" ", "_")}.xlsx')

    if not os.path.exists(model_file) or not os.path.exists(excel_file_path):
        return jsonify({'error': 'Model or data not found'}), 404

    model = joblib.load(model_file)
    df = pd.read_excel(excel_file_path)
    last_date = df['Date'].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, 8)]

    future_days = pd.DataFrame({
        'Day': [date.dayofyear for date in future_dates],
        'Competitor Price': np.random.uniform(low=df['Competitor Price'].min(), high=df['Competitor Price'].max(), size=7),
        'Discount': np.random.choice([0, 5, 10, 15, 20], size=7),
        'Promotional Campaign': np.random.choice([0, 1], size=7),
        'Season_Spring': [1 if date.month in [3, 4, 5] else 0 for date in future_dates],
        'Season_Summer': [1 if date.month in [6, 7, 8] else 0 for date in future_dates],
        'Season_Autumn': [1 if date.month in [9, 10, 11] else 0 for date in future_dates],
        'Season_Winter': [1 if date.month in [12, 1, 2] else 0 for date in future_dates]
    })

    for column in model.feature_names_in_:
        if column not in future_days.columns:
            if column in df.columns:
                future_days[column] = df[column].mode()[0] if df[column].dtype == 'object' else df[column].median()
            else:
                future_days[column] = 0

    future_days = future_days[model.feature_names_in_]
    predicted_prices = model.predict(future_days)

    # Plotting
    plt.figure(figsize=(12, 8))
    plt.plot(df['Date'], df['Price'], color='red', label='Existing Prices')
    plt.plot(future_dates, predicted_prices, color='green', label='Predicted Prices')

    df['Avg Price'] = df['Price'].rolling(window=7).mean()
    plt.plot(df['Date'], df['Avg Price'], color='blue', linestyle='--', label='7-Day Avg Price')

    plt.plot(future_dates, future_days['Competitor Price'], color='orange', linestyle=':', label='Competitor Prices')

    promo_days = df[df['Promotional Campaign'] == 1]['Date']
    plt.scatter(promo_days, df[df['Promotional Campaign'] == 1]['Price'], color='purple', marker='x', s=100, label='Promotional Campaign')

    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.title(f'Price Prediction for {product_name}')
    plt.legend()
    plt.grid(True)

    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    img_base64 = base64.b64encode(img.getvalue()).decode()

    return jsonify({'image': img_base64, 'predicted_prices': predicted_prices.tolist()})

# Define the class labels (should match the labels used during training)
CLASS_LABELS = ['tulsi', 'neem', 'betele']  # Replace with your actual class labels

@app.errorhandler(Exception)
def handle_exception(e):
    logging.error(f"Unhandled exception: {str(e)}")
    return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/identify_plant', methods=['GET', 'POST'])
def identify_plant():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if file:
            try:
                # Process the uploaded image directly in memory without saving
                img = Image.open(io.BytesIO(file.read()))
                img = img.resize((224, 224))  # Resize to the model's expected input size
                img_array = img_to_array(img)
                img_array = np.expand_dims(img_array, axis=0)
                img_array = preprocess_input(img_array)

                # Predict the plant type
                predictions = plant_model.predict(img_array)
                class_idx = np.argmax(predictions)
                
                # Use predefined class labels
                class_label = CLASS_LABELS[class_idx]

                return jsonify({"plant_type": class_label})
            
            except Exception as e:
                logging.error(f"Error during prediction: {str(e)}")
                return jsonify({"error": "An error occurred during prediction"}), 500
    
    return render_template('upload.html')

# Function to predict leaf type using image path
def predict_leaf_type(image_path):
    img = load_img(image_path, target_size=(224, 224))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    
    predictions = plant_model.predict(img_array)
    class_idx = np.argmax(predictions)
    
    # Use predefined class labels
    class_label = CLASS_LABELS[class_idx]
    
    return class_label

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    user_message = data['message']
    
    # Simple AI response logic (replace with more sophisticated AI in production)
    if 'recommendation' in user_message.lower():
        reply = "Based on your interests, I recommend trying our Vitamin C Serum for skincare or our Organic Ragi for a healthy diet."
    elif 'price' in user_message.lower():
        reply = "Our prices are competitive and offer great value. You can use the 'Predict Price' feature to get detailed price predictions for specific products."
    else:
        reply = "How can I assist you with our products today?"
    
    return jsonify({"reply": reply})

@app.route('/products')
def get_products():
    return jsonify(products)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ecom')
def eco():
    return render_template('index2.html')

@app.route('/edu')
def edu():
    return render_template('education.html')

@app.route('/wet')
def wet():
    return render_template('Prediction.html')

@app.route('/plant')
def upl():
    return render_template('upload.html')
@app.route('/doc')
def doc():
    return render_template('doc.html')

if __name__ == '__main__':
    app.run(debug=True)
