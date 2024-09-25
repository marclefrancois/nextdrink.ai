import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Platform, useColorScheme, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function Onboarding() {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission nécessaire', 'L\'accès à la caméra est nécessaire pour prendre une photo.');
      }
    })();
  }, []);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'L\'accès à la caméra est nécessaire pour prendre une photo.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveUserInfo = async () => {
    if (name && image) {
      await SecureStore.setItemAsync('userName', name);
      await SecureStore.setItemAsync('userImage', image);
      router.replace('/');  // Navigate to the main app screen
    } else {
      alert('Veuillez entrer votre nom et choisir une photo');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, colorScheme === 'dark' && styles.darkContainer]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, colorScheme === 'dark' && styles.darkText]}>Bienvenue sur NextDrink.ai</Text>
        </View>
        <TouchableOpacity style={styles.imagePlaceholder} onPress={takePhoto}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderContent}>
              <Text style={styles.placeholderText}>Prendre une photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <TextInput
          style={[styles.input, colorScheme === 'dark' && styles.darkInput]}
          placeholder="Entrez votre nom"
          placeholderTextColor={colorScheme === 'dark' ? '#a0a0a0' : 'gray'}
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={saveUserInfo}>
          <Text style={styles.buttonText}>Sois le party 🥃</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40, // Add some space below the title
    marginTop: 60, // Add some space above the title for status bar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 75,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#d0d0d0', // Changed from '#f0f0f0' to a darker shade
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  placeholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#007AFF',
    fontSize: 16,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkText: {
    color: 'white',
  },
  darkInput: {
    color: 'white',
    borderColor: '#a0a0a0',
  },
});