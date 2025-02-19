import { Text, TextInput, StyleSheet, View, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import React from 'react';

interface AuthFormProps {
    title: string;
    actionText: string;
    action: (email: string, password: string) => void;
    inputContainerStyle?: any;
    buttonStyle?: any;
}

export function AuthForm(props: AuthFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [validPassword, setValidPassword] = useState(false);

    useEffect(() => {
        if (email.indexOf('@') > 0 && email.length >= 6) {
            setValidEmail(true);
        } else {
            setValidEmail(false);
        }
    }, [email]);

    useEffect(() => {
        if (password.length >= 8) {
            setValidPassword(true);
        } else {
            setValidPassword(false);
        }
    }, [password]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{props.title}</Text>

            <View style={[styles.inputContainer, props.inputContainerStyle]}> {/* Apply input container style */}
                <Text>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <Text>Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
            </View>

            <Pressable
                onPress={() => props.action(email, password)}
                style={[
                    (validEmail && validPassword) ? styles.button : styles.buttonDisabled,
                    props.buttonStyle, // Apply button style
                ]}
                disabled={!(validEmail && validPassword)} // Simplified disabled logic
            >
                <Text style={styles.buttonText}>{props.actionText}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 100,
        padding: 20,
        backgroundColor: "#1d95e2",
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {  // Default input container styles
        marginBottom: 15,
    },
    label: {
        marginBottom: 6,
        color: '#333333',
    },
    input: {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#cccccc",
        padding: 6,
        marginBottom: 20,
        backgroundColor: "#efefef",
        borderRadius: 6,
    },
    button: {
        backgroundColor: "#333333",
        borderRadius: 4,
    },
    buttonText: {
        color: "#efefef",
        textAlign: "center",
        padding: 8,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: "#888888",
        borderRadius: 4,
    },
    buttonTextDisabled: { // This style is not used directly, but could be
        color: "#666666",
        textAlign: "center",
        padding: 8,
    },
});