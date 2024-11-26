import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function AdminHomeScreen({ route }) {
  const { userId } = route.params;
  const navigation = useNavigation();

  const [categoryName, setCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      const categorySnapshot = await firestore().collection('Categories').get();
      const categoryList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoryList);
    } catch (error) {
      console.error('Error fetching categories: ', error);
    }
  };

  // Fetch products for a selected category
  const fetchProducts = async (categoryId) => {
    try {
      const productSnapshot = await firestore()
        .collection('Categories')
        .doc(categoryId)
        .collection('Products')
        .get();
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products: ', error);
    }
  };

  // Add a new category to Firestore
  const handleAddCategory = async () => {
    if (categoryName.trim() === '') {
      Alert.alert('Error', 'Category name cannot be empty.');
      return;
    }
    try {
      const categoryRef = await firestore().collection('Categories').add({
        name: categoryName,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Success', 'Category added successfully!');
      setCategoryName('');
      fetchCategories(); // Refresh the category list
    } catch (error) {
      console.error('Error adding category: ', error);
      Alert.alert('Error', 'Failed to add category.');
    }
  };

  // Add a new product to a selected category in Firestore
  const handleAddProduct = async () => {
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category first.');
      return;
    }
    if (productName.trim() === '' || productPrice.trim() === '') {
      Alert.alert('Error', 'Product name and price cannot be empty.');
      return;
    }
    try {
      const productRef = await firestore()
        .collection('Categories')
        .doc(selectedCategoryId)
        .collection('Products')
        .add({
          name: productName,
          price: parseFloat(productPrice),
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      Alert.alert('Success', 'Product added successfully!');
      setProductName('');
      setProductPrice('');
      fetchProducts(selectedCategoryId); // Refresh the product list
    } catch (error) {
      console.error('Error adding product: ', error);
      Alert.alert('Error', 'Failed to add product.');
    }
  };

  // Sign out the admin
  const handleSignOut = async () => {
    try {
      await auth().signOut();
      navigation.navigate('AdminLoginScreen');
    } catch (error) {
      console.error('Error signing out: ', error);
      Alert.alert('Error', error.message);
    }
  };

  // Fetch categories on component mount
  React.useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome, Admin ID: {userId}</Text>

      {/* Category Management */}
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Add New Category</Text>
        <TextInput
          placeholder="Enter category name"
          value={categoryName}
          onChangeText={setCategoryName}
          style={{ borderBottomWidth: 1, marginBottom: 10 }}
        />
        <Button title="Add Category" onPress={handleAddCategory} />
      </View>

      {/* Category List */}
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Categories</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text
              style={{
                padding: 10,
                backgroundColor: selectedCategoryId === item.id ? 'lightgray' : 'white',
              }}
              onPress={() => {
                setSelectedCategoryId(item.id);
                fetchProducts(item.id);
              }}
            >
              {item.name}
            </Text>
          )}
        />
      </View>

      {/* Product Management */}
      {selectedCategoryId && (
        <View style={{ marginVertical: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Add New Product</Text>
          <TextInput
            placeholder="Enter product name"
            value={productName}
            onChangeText={setProductName}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Enter product price"
            value={productPrice}
            onChangeText={setProductPrice}
            keyboardType="numeric"
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <Button title="Add Product" onPress={handleAddProduct} />
        </View>
      )}

      {/* Product List */}
      {selectedCategoryId && (
        <View style={{ marginVertical: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Products in Selected Category</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={{ padding: 10 }}>
                {item.name} - ${item.price.toFixed(2)}
              </Text>
            )}
          />
        </View>
      )}

      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}
