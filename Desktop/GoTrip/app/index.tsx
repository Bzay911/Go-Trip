import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { useContext, useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from '@firebase/auth';
import { useRouter } from 'expo-router';
import { ErrorMessage } from '@/components/ErrorMessage';
import React from 'react';
import { Entypo, FontAwesome } from '@expo/vector-icons';

export default function Signup() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [passwordValid, setPasswordValid] = useState(false); 
    const [passwordFocused, setPasswordFocused] = useState(false); // Track if password field is focused

    // Regular expression for validating email format
    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    // Password validation criteria
    const validatePassword = (password: string) => {
        // Password must have at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const createAccount = async () => {
        setError(null);

        // Validation checks for empty fields, mismatched passwords, and invalid email
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all the fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        try {
            // Create the user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile with name
            await updateProfile(user, { displayName: name });

            // Send email verification
            await sendEmailVerification(user);

            Alert.alert('Check your inbox', 'A verification email has been sent. Please verify your email before logging in.');

            // Redirect to login screen after signing up and sending the email verification
            router.replace('/login');  // Navigate to the login screen after signup
        } catch (err: any) {
            // Handle Firebase specific error codes
            if (err.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email is already in use. Please use a different email address.');
            } else if (err.code === 'auth/invalid-email') {
                Alert.alert('Error', 'The email address is not valid.');
            } else {
                setError(err.code);
                console.error("Firebase Error:", err);
            }
        }
    };

    // Update password validity when password changes
    const handlePasswordChange = (newPassword: string) => {
        setPassword(newPassword);
        setPasswordValid(validatePassword(newPassword));
    };

    // Criteria check state
    const passwordCriteria = [
        { regex: /[a-z]/, label: "At least one lowercase letter", met: password.match(/[a-z]/) },
        { regex: /[A-Z]/, label: "At least one uppercase letter", met: password.match(/[A-Z]/) },
        { regex: /\d/, label: "At least one number", met: password.match(/\d/) },
        { regex: /[@$!%*?&]/, label: "At least one special character", met: password.match(/[@$!%*?&]/) },
        { regex: /.{8,}/, label: "At least 8 characters", met: password.length >= 8 },
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar backgroundColor="white" barStyle="dark-content" />

            <View style={styles.content}>
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
                            onChangeText={handlePasswordChange}
                            secureTextEntry
                            onFocus={() => setPasswordFocused(true)} // Set password field to focused
                            onBlur={() => setPasswordFocused(false)}  // Unset password field focus
                        />
                    </View>

                    {/* Password Criteria Display */}
                    {passwordFocused && (
                        <View style={styles.passwordCriteriaContainer}>
                            {passwordCriteria.map((criterion, index) => (
                                <View key={index} style={styles.passwordCriteriaRow}>
                                    <Text style={[styles.passwordCriteriaText, { color: criterion.met ? 'green' : 'red' }]}>
                                        {criterion.met ? '✔' : '✘'} {criterion.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

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

                    <TouchableOpacity
                        style={[styles.button, { opacity: passwordValid ? 1 : 0.5 }]} // Disable button if password is invalid
                        onPress={createAccount}
                        disabled={!passwordValid}
                    >
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.orContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>or continue with</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.googleButton}>
                    <FontAwesome name="google" size={20} color="white" />
                    <Text style={styles.googleButtonText}>Sign Up with Google</Text>
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
        justifyContent: 'center',
        padding: 20,
    },
    content: {
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
    passwordCriteriaContainer: {
        marginTop: 10,
    },
    passwordCriteriaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordCriteriaText: {
        fontSize: 12,
        marginLeft: 10,
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
