import { View, Text, StyleSheet, StatusBar, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { ErrorMessage } from '@/components/ErrorMessage';
import React from 'react';

export default function Login() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const SignIn = async () => {
        setError(null);

        // Validate if email or password is missing
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        try {
            // Attempt to sign in with email and password
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)/profile');
        } catch (err: any) {
            // Handle Firebase specific error codes
            if (err.code === 'auth/user-not-found') {
                Alert.alert("Error", "No user found with this email.");
            } else if (err.code === 'auth/wrong-password') {
                Alert.alert("Error", "Incorrect password. Please try again.");
            } else if (err.code === 'auth/invalid-email') {
                Alert.alert("Error", "The email address is not valid.");
            } else {
                Alert.alert("Error", "An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar backgroundColor="white" barStyle="dark-content" />

            <View style={styles.content}>
                {/* Title and Subtitle */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Hello Again!</Text>
                    <Text style={styles.subtitle}>Welcome back you've been missed!</Text>
                </View>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
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

                    <TouchableOpacity style={styles.forgotPassword} onPress={() => { /* Handle forgot password */ }}>
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={SignIn}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </View>

                {/* OR and Google Button */}
                <View style={styles.orContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>or continue with</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.googleButton}>
                    <FontAwesome name="google" size={20} color="white" />
                    <Text style={styles.googleButtonText}>Google</Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signupContainer}>
                    <Text>Don't have an account?</Text>
                    <Link href='/'>
                        <Text style={styles.signupLink}>Go to Sign Up</Text>
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
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 20,
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
        marginRight: 10,
        color: '#A0A3A8',
    },
    input: {
        flex: 1,
        height: 40,
        color: '#212529',
    },
    forgotPassword: {
        alignSelf: 'flex-end', // Align to the right
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#E82E06',
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
        marginBottom: 20,
    },
    googleButtonText: {
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 15,
    },
    signupLink: {
        color: "#E82E06",
        marginLeft: 5,
    
    },

});
