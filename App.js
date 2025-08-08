// App.js
import "react-native-gesture-handler"; // Must be first
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

import StockListScreen from "./src/screens/StockListScreen";
import SalesEntryScreen from "./src/screens/SalesEntryScreen";
import OutOfStockScreen from "./src/screens/OutOfStockScreen";
import PatientRegistrationScreen from "./src/screens/PatientRegistrationScreen";
import PatientQueueScreen from "./src/screens/PatientQueueScreen";
import ConsultationScreen from "./src/screens/ConsultationScreen";
import PatientRecordsScreen from "./src/screens/PatientRecordsScreen";
import { StockProvider } from "./src/context/StockContext";
import { PatientProvider } from "./src/context/PatientContext";
import { RecordProvider } from './src/context/RecordContext';


const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <PatientProvider>
       <RecordProvider>
    <StockProvider>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="SalesEntry"
          screenOptions={({ navigation }) => ({
            headerStyle: { backgroundColor: "#A8E6CF" },
            headerTintColor: "#264653",
            headerTitleStyle: { fontWeight: "700", fontSize: 22 },
            headerTitleAlign: "center", // 👈 Center the title!
            drawerActiveTintColor: "#264653",
            drawerLabelStyle: { fontSize: 18 },
            gestureEnabled: true,
            headerLeft: () => (
              <Ionicons
                name="menu"
                size={36} // 👈 Bigger hamburger icon
                color="#264653"
                style={{ marginLeft: 16 }}
                onPress={() => navigation.toggleDrawer()}
              />
            ),
          })}
        >
          <Drawer.Screen
            name="MedicineStore"
            component={StockListScreen}
            options={{ title: "Medicine Store" }}
          />
          <Drawer.Screen
            name="SalesEntry"
            component={SalesEntryScreen}
            options={{ title: "Sales Entry" }}
          />
          <Drawer.Screen
            name="OutOfStock"
            component={OutOfStockScreen}
            options={{ title: "Out of Stock" }}
          />
          <Drawer.Screen
            name="PatientRegistration"
            component={PatientRegistrationScreen}
            options={{
              title: "Patient Registration"
            }}
          />
          <Drawer.Screen
            name="PatientQueue"
            component={PatientQueueScreen}
           options={{
              title: 'Patient Queue',
              drawerLabel: 'Patient Queue'
            }}
          />
          <Drawer.Screen
  name="Consultation"
  component={ConsultationScreen}
  options={{ title: 'Consultation', drawerLabel: 'Consultation' }}
/>
<Drawer.Screen
              name="PatientRecords"
              component={PatientRecordsScreen}
              options={{ title: 'Patient Records', drawerLabel: 'Patient Records' }}
            />

        </Drawer.Navigator>
      </NavigationContainer>
    </StockProvider>
     </RecordProvider>
    </PatientProvider>
  );
}
