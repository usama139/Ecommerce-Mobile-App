import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen({ route }) {
  const { userId } = route.params;
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await firestore().collection('Categories').get();
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories: ', error);
        Alert.alert('Error', 'Failed to load categories.');
      }
    };

    fetchCategories();
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await auth().signOut();
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error signing out: ', error);
      Alert.alert('Error', error.message);
    }
  };

  // Render each category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        navigation.navigate('ProductListScreen', {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome,</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No categories available.</Text>}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.signOutButton}>
        <Button title="Sign Out" onPress={handleSignOut} color="#d9534f" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  categoryItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryText: {
    fontSize: 18,
    color: '#007bff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6c757d',
  },
  separator: {
    height: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  signOutButton: {
    marginTop: 20,
    alignSelf: 'center',
    width: '50%',
  },
});
