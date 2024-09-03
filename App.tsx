// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {NavigationContainer} from '@react-navigation/native';
// import React, {useEffect, useRef, useState} from 'react';
// import 'react-native-gesture-handler';
// import {
//   MD3LightTheme,
//   Provider as PaperProvider,
//   useTheme,
// } from 'react-native-paper';
// import {SafeAreaProvider} from 'react-native-safe-area-context';
// import MainStack from './src/navigators/MainStack';

// // import at the very top of everything.
// import './ignoreWarnings';
// import RNBootSplash from 'react-native-bootsplash';
// import appTheme from './src/theme/Index';
// import {AppProvider} from './src/store/AppContext';

// const theme = {
//   ...MD3LightTheme,
//   ...appTheme,
// };

// export type AppTheme = typeof theme;

// export const useAppTheme = () => useTheme<AppTheme>();

// function App() {
//   const nav = useRef(null);
//   const [token, setToken] = useState<String | null | undefined>(undefined);

//   useEffect(() => {
//     const fun = async () => {
//       let getToken = await AsyncStorage.getItem('token');
//       setToken(getToken);
//     };
//     fun();
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       // …do multiple sync or async tasks
//     };

//     init().finally(async () => {
//       await RNBootSplash.hide({fade: true, duration: 500});
//       console.log('BootSplash has been hidden successfully');
//     });
//   }, []);

//   return (
//     <AppProvider>
//       <SafeAreaProvider>
//         <PaperProvider theme={theme}>
//           <NavigationContainer ref={nav}>
//             <MainStack token={token} />
//           </NavigationContainer>
//         </PaperProvider>
//       </SafeAreaProvider>
//     </AppProvider>
//   );
// }

// export default App;
import React from 'react';
import {NavigationContainer, RouteProp} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AuthLoadingScreen from './src/Login/AuthLoadingScreen';
import LoginScreen from './src/Login/LoginScreen';
import OnlineCigaretteSale from './src/Component/Smocking/OnlineCigaretteSale';
import CustomMaterialMenu from './src/Component/menu/CustomMaterialMenu';
import EmployeeDataWithCardWise from './src/Component/EmployeeCardScann/EmployeeDataWithCardWise';
import EmployeeCardNumberWiseLogin from './src/Component/EmployeeCardScann/EmployeeCardNumberWiseLogin';
import EmployeeCardWiseOnlineCigaretteSale from './src/Component/EmployeeCardScann/EmployeeCardWiseOnlineCigaretteSale';
import VersionCheck from './src/Component/Version/VersionCheck';
import DownloadScreen from './src/Component/Download/DownloadScreen';
import BkashPaymentGetway from './src/Bkash/BkashPaymentGetway';
import OnlineCigaretteBuyAndPaymentOnline from './src/Component/Smocking/OnlineCigaretteBuyAndPaymentOnline';
import PaymentCancel from './src/Bkash/PaymentCancel';
import PaymentSuccess from './src/Bkash/PaymentSuccess';
import StockEntry from './src/Stock/StockEntry';

type RootStackParamList = {
  VersionCheck: undefined;
  AuthLoadingScreen: undefined;
  DownloadScreen: undefined;
  EmployeeDataWithCardWise: undefined;
  EmployeeCardNumberWiseLogin: undefined;
  EmployeeCardWiseOnlineCigaretteSale: undefined;
  LoginScreen: undefined;
  OnlineCigaretteSale: undefined;
  OnlineCigaretteBuyAndPaymentOnline: undefined;
  headerMode: any;
  BkashPaymentGetway: undefined;
  PaymentCancel: undefined;
  PaymentSuccess: undefined;
  StockEntry: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({route, navigation}) => ({
          headerRight: () => (
            <CustomMaterialMenu
              menuText="Menu"
              textStyle={{color: 'white'}}
              navigation={navigation}
              route={route}
              isIcon={true}
            />
          ),
          headerStyle: {
            backgroundColor: '#0078D7', // Set Header color
            opacity: 0.8,
          },
          statusBarColor: '#0078D7',
          headerTintColor: '#fff', // Set Header text color
          headerTitleStyle: {
            fontWeight: 'bold', // Set Header text style
          },
        })}>
        <Stack.Screen
          name="VersionCheck"
          component={VersionCheck}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="AuthLoadingScreen"
          component={AuthLoadingScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="DownloadScreen"
          component={DownloadScreen}
          options={{headerShown: false}}
        />

        {/* ---------------------------------------------------------------- */}

        <Stack.Screen
          name="EmployeeDataWithCardWise"
          component={EmployeeDataWithCardWise}
          // options={{
          //   headerShown: false,
          //   headerTitle: 'Employee Data Card Wise',
          //   headerTintColor: '#ffffff',
          //   headerMode: 'none',
          //   navigationOptions: {
          //     headerVisible: false,
          //   },
          //   headerTitleStyle: {
          //     fontSize: 15,
          //   },
          // }}
        />

        <Stack.Screen
          name="EmployeeCardNumberWiseLogin"
          component={EmployeeCardNumberWiseLogin}
          // options={{
          //   //headerShown: false,
          //   headerTitle: 'Employee Card Number Wise Login',
          //   headerTintColor: '#ffffff',
          //   headerMode: 'none',
          //   navigationOptions: {
          //     headerVisible: false,
          //   },
          //   headerRight: () => null,
          //   headerTitleStyle: {
          //     fontSize: 15,
          //   },
          // }}
        />

        <Stack.Screen
          name="EmployeeCardWiseOnlineCigaretteSale"
          component={EmployeeCardWiseOnlineCigaretteSale}
          options={{
            headerShown: true,
            title: 'Smoking Blender Employee Card',
            headerBackVisible: false,
            headerTitleStyle: {
              fontSize: 15,
            },
          }}
        />

        {/* ------------------------------------------------------------------------ */}
        <Stack.Screen
          name="BkashPaymentGetway"
          component={BkashPaymentGetway}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          // options={{
          //   headerShown: false,
          //   headerTitle: 'Login',
          //   headerTintColor: '#ffffff',
          //   headerMode: 'none',
          //   navigationOptions: {
          //     headerVisible: false,
          //   },
          //   headerTitleStyle: {
          //     fontSize: 15,
          //   },
          // }}
        />

        <Stack.Screen
          name="OnlineCigaretteBuyAndPaymentOnline"
          component={OnlineCigaretteBuyAndPaymentOnline}
          // options={{
          //   statusBarColor: '#C90002',
          //   headerShown: true,
          //   headerTitle: 'Payment Cancelled',
          //   headerTintColor: '#ffffff',
          //   headerMode: 'none',
          //   headerBackVisible: false,
          //   navigationOptions: {
          //     headerVisible: false,
          //   },
          //   headerStyle: {
          //     backgroundColor: '#C90002', // Set Header color
          //   },
          //   headerTitleStyle: {
          //     fontSize: 15,
          //   },
          // }}
        />

        <Stack.Screen
          name="OnlineCigaretteSale"
          component={OnlineCigaretteSale}
          options={{
            headerShown: true,
            title: 'Smoking Blender',
            headerBackVisible: false,
            headerTitleStyle: {
              fontSize: 15,
            },
          }}
        />

        <Stack.Screen
          name="PaymentCancel"
          component={PaymentCancel}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccess}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="StockEntry"
          component={StockEntry}
          options={{
            headerShown: true,
          }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default App;
