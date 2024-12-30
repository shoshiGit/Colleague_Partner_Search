import axios from "axios";

// פונקציית API שמחזירה כתובות תואמות מתוך OpenStreetMap
const baseUrl = "https://nominatim.openstreetmap.org";

export const getAddressFromServer = (address) => {
    return axios.get(`${baseUrl}/search?format=json&q=${address}&limit=6`);
};