import {
    Modal as RnModal,
    ModalProps,
    KeyboardAvoidingView,
    View,
    Platform,
  } from "react-native";
  type PROPS = ModalProps & {
    isOpen: boolean;
    withInput?: boolean;
  };
  export default function Modal({ isOpen, withInput, children, ...rest }: PROPS) {
    const content = withInput ? (
      <KeyboardAvoidingView
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          paddingHorizontal: 3,
          backgroundColor: "rgba(24, 24, 27, 0.4)",
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {children}
      </KeyboardAvoidingView>
    ) : (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          paddingHorizontal: 3,
          backgroundColor: "rgba(24, 24, 27, 0.4)",
        }}
      >
        {children}
      </View>
    );
    return (
      <RnModal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        {...rest}
      >
        {content}
      </RnModal>
    );
  }
  