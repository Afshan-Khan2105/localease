// import { useState } from "react";
// import { getCurrentLocation } from "@/sanity/lib/geoLocation/getCurrentLocation"; // Import helper function

// const AddProductForm = () => {
//     const [location, setLocation] = useState({ latitude: null, longitude: null });

//     const handleFetchLocation = async () => {
//         try {
//             const userLocation = await getCurrentLocation();
//             setLocation(userLocation);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     return (
//         <div>
//             <button onClick={handleFetchLocation}>Get Current Location</button>
//             {location.latitude && (
//                 <p>
//                     Location: {location.latitude}, {location.longitude}
//                 </p>
//             )}
//         </div>
//     );
// };
