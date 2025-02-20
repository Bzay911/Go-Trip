import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from '@firebase/auth'; // Import updateProfile
import { useRouter } from 'expo-router';
import { ErrorMessage } from '@/components/ErrorMessage';
import React from 'react';
import { Entypo, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function Signup() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState(''); // Add name state

    const createAccount = async () => {
        setError(null);

        // Validation checks for empty fields and mismatched passwords
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all the fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile with name
            await updateProfile(user, { displayName: name }); // Update display name

            router.replace('/(tabs)/profile'); // Redirect to profile after signup
        } catch (err: any) {
            setError(err.code);
            console.error("Firebase Error:", err);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace('/(tabs)/profile'); 
            }
        });
        return () => unsubscribe(); 
    }, [auth, router]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust for keyboard
            style={styles.container}
        >
            <StatusBar backgroundColor="white" barStyle="dark-content" />

            <View style={styles.content}> {/* Content wrapper for centering */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>New to Go Trip?</Text>
                    <Text style={styles.subtitle}>Sign up and enjoy locally</Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                    <FontAwesome name="user" size={20} color="#A0A3A8" />
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            placeholderTextColor="#A0A3A8"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Entypo name="mail" size={20} color="#A0A3A8" />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#A0A3A8"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <FontAwesome name="lock" size={20} color="#A0A3A8" />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#A0A3A8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <FontAwesome name="lock" size={20} color="#A0A3A8" />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#A0A3A8"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={createAccount}>
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.orContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>or continue with</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.googleButton}>
                    <FontAwesome name="google" size={20} color="white" />
                    <Text style={styles.googleButtonText}>Google</Text>
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text>Already have an account?</Text>
                    <Link href='/login'>
                        <Text style={styles.loginLink}>Go to Sign in</Text>
                    </Link>
                </View>

                <ErrorMessage error={error} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center', // Center vertically
        padding: 20,
    },
    content: { // Style for content wrapper
        width: '100%',
    },
    titleContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#212529',
    },
    subtitle: {
        fontSize: 16,
        color: '#212529',
    },
    inputContainer: {
        marginBottom: 15,
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
    },
    inputIcon: {
        marginRight: 20,
        color: '#A0A3A8',
        fontSize: 20,
    },
    input: {
        flex: 1,
        height: 40,
        color: '#212529',
    },
    button: {
        backgroundColor: '#007BFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#CED4DA',
    },
    orText: {
        marginHorizontal: 10,
        color: '#212529',
    },
    googleButton: {
        backgroundColor: '#4285F4',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    googleButtonText: {
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: "row",
        fontWeight: 'bold',
        justifyContent: "center",
        marginTop: 15,
    },
    loginLink: {
        color: "#E82E06",
        marginLeft: 5,
    },
});

