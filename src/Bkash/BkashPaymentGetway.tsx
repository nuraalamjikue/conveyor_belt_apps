import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import instance from '../Axiosinstance';
import {WebView} from 'react-native-webview';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  OnlineCigaretteBuyAndPaymentOnlines: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
  };
  PaymentCancel: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
    Status: string;
  };
  PaymentSuccess: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
    Status: string;
  };
  OnlineCigaretteBuyAndPaymentOnline: undefined;
};

type OnlineCigaretteBuyAndPaymentOnlineScreenRouteProp = RouteProp<
  RootStackParamList,
  'OnlineCigaretteBuyAndPaymentOnlines'
>;

type PaymentCancelScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PaymentCancel',
  'PaymentSuccess'
>;

const PaymentScreen = () => {
  const [bkashURL, setBkashURL] = useState<string | null>(null);

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };

  const route = useRoute<OnlineCigaretteBuyAndPaymentOnlineScreenRouteProp>();
  const navigation = useNavigation<PaymentCancelScreenNavigationProp>();
  const {TatalSelectedData, TotalAmount, InvoiceMasterID} = route.params;

  const initiateBkashPayment = async () => {
    try {
      setBkashURL(null);
      const paymentResponse = await instance.post(
        'bkash/payment/create',
        {
          amount: TotalAmount.toString(),
          invoiceNumber: `INV${InvoiceMasterID}`, // Use dynamic invoice number
        },
        {withCredentials: true},
      );

      if (paymentResponse.data && paymentResponse.data.bkashURL) {
        setBkashURL(paymentResponse.data.bkashURL);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error: any) {
      Alert.alert(
        'Payment Error',
        'Failed to initiate payment. Please try again.',
      );
    }
  };

  useEffect(() => {
    initiateBkashPayment();
  }, []); // Empty dependency array to ensure it runs only once

  const handleNavigationChange = async (navState: any) => {
    const url = navState.url;
    console.log('Navigation ----- ' + url);

    if (url.includes('cancel')) {
      navigation.navigate('PaymentCancel', {
        TatalSelectedData,
        TotalAmount,
        InvoiceMasterID,
        Status: 'Cancelled',
      });
      setBkashURL(null);
    } else if (url.includes('failure')) {
      navigation.navigate('PaymentCancel', {
        TatalSelectedData,
        TotalAmount,
        InvoiceMasterID,
        Status: 'Failed',
      });
      setBkashURL(null);
    } else if (url.includes('success')) {
      navigation.navigate('PaymentSuccess', {
        TatalSelectedData,
        TotalAmount,
        InvoiceMasterID,
        Status: 'success',
      });
      setBkashURL(null);
    } else if (url.includes('error')) {
      console.log('payment error hear');
      handleToastMsg('error', `payment error`);
      setTimeout(() => {
        navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
      }, 3000); // 5000 milliseconds = 5 seconds
      setBkashURL(null);
    }
  };
  console.log('bkashURL ' + bkashURL);

  return (
    <View style={{flex: 1}}>
      <Toast />
      {bkashURL ? (
        <WebView
          source={{uri: bkashURL}}
          style={styles.webview}
          onNavigationStateChange={handleNavigationChange} // Monitor for navigation state changes
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Payment...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  webview: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 20,
  },
});

export default PaymentScreen;
