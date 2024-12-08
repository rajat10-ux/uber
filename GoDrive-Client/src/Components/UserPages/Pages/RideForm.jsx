import React, { useEffect, useState, useRef } from "react";
import { getGeocodeData } from "../../../Service/api";
import api from "../../../Utils/axios";
import FormField from "./FormComponent/FormField";
import { FaClock, FaGooglePay, FaRupeeSign } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import {
  RiUserAddFill,
  RiMapPinLine,
  RiPinDistanceFill,
  RiArrowDropDownLine,
} from "react-icons/ri";

import { BiSolidCalendarHeart } from "react-icons/bi";
import { GiSandsOfTime } from "react-icons/gi";
import { TiCancel } from "react-icons/ti";
import { BsCashCoin } from "react-icons/bs";
import { SiPhonepe } from "react-icons/si";

import constants from "../../../Utils/constant";

const HERE_API_KEY = "1GAoVaOcX3MUdbsw4qhCqJp6MnKlEPzVP-db90XTZDg";

// const GOOGLE_MAPS_API_KEY = "AIzaSyCVQw0r3rQJRv4Y9y8FZDwz7tWUM3_D2Q4";

const RideForm = () => {
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("Pickup now");
  const [forWhom, setForWhom] = useState("For me");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSecondPopupOpen, setIsSecondPopupOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [thirdPopupOpen, setThirdPopupOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [tempPayment, setTempPayment] = useState("");

  const [isForm1Visible, setIsForm1Visible] = useState(true); // Default to true
  const [isForm2Visible, setIsForm2Visible] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const mapRef = useRef(null);
  const routingRef = useRef(null);

  const togglePopup = () => setIsPopupOpen((prev) => !prev);
  const closePopup = () => setIsPopupOpen(false);
  const toggleSecondPopup = () => setIsSecondPopupOpen((prev) => !prev);
  const closeSecondPopup = () => setIsSecondPopupOpen(false);

 
  // const [fourthPopupOpen, setfourthPopupOpen] = useState(true);

  const closefourthPopup = () => setIsForm2Visible(true);

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  const isButtonDisabled =
    !firstName || !lastName || !phoneNumber || !countryCode;

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handlePickup = () => {
    setIsForm1Visible(false);
    setIsForm2Visible(true);
  };
  const handleClear = () => {
    setPickupTime({ date: "", time: "" });
  };

  useEffect(() => {
    const fetchUserDetails = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const name = localStorage.getItem("name");
          const userEmail = localStorage.getItem("userEmail");
          const decodedToken = JSON.parse(atob(token.split(".")[1]));

          setName(name || "");
          setUserEmail(userEmail || "");
          setUserId(decodedToken.id);
        } catch (error) {
          console.error(
            "Error fetching user details from localStorage:",
            error
          );
        }
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      const platform = new H.service.Platform({ apikey: HERE_API_KEY });
      const defaultLayers = platform.createDefaultLayers();

      const mapElement = document.getElementById("map");
      mapElement.style.width = "800px";
      mapElement.style.height = "500px";
      mapElement.style.position = "relative";
      mapElement.style.overflow = "hidden";

      mapRef.current = new H.Map(mapElement, defaultLayers.vector.normal.map, {
        zoom: 12,
        center: { lat: 13.0303, lng: 80.1696 },
      });

      const behavior = new H.mapevents.Behavior(
        new H.mapevents.MapEvents(mapRef.current)
      );
      const ui = H.ui.UI.createDefault(mapRef.current, defaultLayers);

      window.addEventListener("resize", () =>
        mapRef.current.getViewPort().resize()
      );
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 13.0303, lng: 80.1696 },
        zoom: 12,
      });

      mapRef.current = map;
      directionsService.current = new window.google.maps.DirectionsService();
      directionsRenderer.current = new window.google.maps.DirectionsRenderer();

      directionsRenderer.current.setMap(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (pickupCoords && dropCoords && mapRef.current) {
      if (routingRef.current) {
        mapRef.current.removeObject(routingRef.current);
      }

      const platform = new H.service.Platform({ apikey: HERE_API_KEY });
      const router = platform.getRoutingService();

      const routeRequestParams = {
        mode: "fastest;car",
        representation: "display",
        routeattributes: "summary",
        maneuverattributes: "all",
        waypoint0: `geo!${pickupCoords.lat},${pickupCoords.lng}`,
        waypoint1: `geo!${dropCoords.lat},${dropCoords.lng}`,
      };

      router.calculateRoute(
        routeRequestParams,
        (result) => {
          if (result.routes.length && result.routes[0].sections.length) {
            const route = result.routes[0];
            const lineString = new H.geo.LineString();

            // Loop through the route's polyline and add it to the lineString
            route.sections.forEach((section) => {
              section.polyline.forEach((point) => {
                const parts = point.split(",");
                lineString.pushLatLngAlt(parts[0], parts[1]);
              });
            });

            // Create the route line with proper style
            const routeLine = new H.map.Polyline(lineString, {
              style: { strokeColor: "black", lineWidth: 5 },
            });

            // Add the route to the map
            mapRef.current.addObject(routeLine);

            // Adjust the map to show the route
            mapRef.current.getViewModel().setLookAtData({
              bounds: routeLine.getBoundingBox(),
            });

            routingRef.current = routeLine;
          }
        },
        (error) => {
          console.error("Routing error:", error);
        }
      );
    }
  }, [pickupCoords, dropCoords]);

  const handleLocationChange = async (e, setter, setSuggestions) => {
    const value = e.target.value;
    setter(value);

    if (value.length > 2) {
      try {
        const data = await getGeocodeData(value);
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion, setter, setSuggestions) => {
    setter(suggestion.display_name);
    setSuggestions([]);

    const coords = {
      lat: suggestion.lat,
      lng: suggestion.lon,
    };

    if (setter === setPickupLocation) {
      setPickupCoords(coords);
    } else {
      setDropCoords(coords);
    }
  };
  const isSearchBtnDisabled =
    !pickupLocation || !dropLocation || !pickupTime || !forWhom;
  const handleSearch = () => {
    if (!isSearchBtnDisabled) {
      setShowForm(true); // Show the form when the search button is clicked
    }
  };
  const handleThirdPopup = () => {
    // setThirdPopupOpen((prev) => !prev);
    setThirdPopupOpen(!thirdPopupOpen);
  };
  const handlePaymentChange = (event) => {
    setTempPayment(event.target.value);
  };
  const handlePaymentMethod = () => {
    if (tempPayment) {
      setSelectedPayment(tempPayment); // Update the main payment method
    }
    setThirdPopupOpen(false); // Close the popup after selecting
  };
  const closethirdPopup = () => setThirdPopupOpen(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tripData = {
      pickupLocation,
      dropLocation,
      pickupTime,
      forWhom,
      userId,
      name,
      firstName,
      lastName,
    };

    try {
      const response = await api.post("/trips/newtrip", tripData);
      console.log("Trip created successfully:", response.data);
    } catch (error) {
      console.error(
        "Error creating trip:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="relative h-full">
      {/* Background that gets blurred */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-3 lg:h-full mt-1 mx-2 gap-3 overflow-hidden ${
          isPopupOpen || isSecondPopupOpen ? "opacity-50 blur-sm" : ""
        } `}
      >
        <div
          id="map"
          className={`lg:h-full w-full sm:order-1 mt-7 bg-gray-200 rounded-lg ${
            showForm ? "lg:col-span-1 lg:order-3" : "lg:col-span-2 lg:order-2"
          }`}
        ></div>

        <div
          id="Vehicle choosing card"
          className={`${
            showForm
              ? "lg:grid-cols-2 w-[420px] mt-7  lg:h-[495px] p-3  lg:order-2  overflow-y-scroll sm:order-1 bg-white shadow-lg rounded-lg"
              : "lg:hidden"
          }`}
        >
          <h2 className="text-2xl text-black font-bold  ">Recommended</h2>
          <div className="border border-black rounded-lg hover:shadow-lg mt-3  p-2  ">
            <div className=" flex gap-2 ">
              <div className="w-28">
                <img src={constants.car5} alt="hgfhjj" />
              </div>
              <div>
                <h3 className=" font-bold ml-2 text-black mr-2">
                  Godrive Swift
                </h3>
                <h4 className="ml-2">Affordable compact rides</h4>
              </div>
              <h1 className="flex mt-5   text-black font-bold">
                <FaRupeeSign className="mt-1" />
                656
              </h1>
            </div>
          </div>
          <div className="border border-black rounded-lg hover:shadow-lg mt-3 p-2  ">
            <div className=" flex gap-2 ">
              <div className="w-28">
                <img src={constants.car5} alt="hgfhjj" />
              </div>
              <div>
                <h3 className=" font-bold ml-2 text-black ">Godrive Premier</h3>
                <h4 className="ml-2">Comfortable Sedans</h4>
              </div>
              <h1 className="flex mt-5 ml-9  text-black  font-bold">
                <FaRupeeSign className="mt-1" />
                1056
              </h1>
            </div>
          </div>
          <div className="border border-black rounded-lg hover:shadow-lg mt-3 p-2  ">
            <div className=" flex gap-2 ">
              <div className="w-28">
                <img src={constants.car5} alt="hgfhjj" />
              </div>
              <div>
                <h3 className=" font-bold ml-2 text-black mr-2">Godrive XL</h3>
                <h4 className="ml-2">Comfortable SUVs</h4>
              </div>
              <h1 className="flex mt-5 ml-12  text-black font-bold ">
                <FaRupeeSign className="mt-1" />
                1500
              </h1>
            </div>
          </div>
          <h2 className="text-2xl text-black mt-3 font-bold">Economy</h2>
          <div className="border border-black rounded-lg hover:shadow-lg mt-3 p-2  ">
            <div className=" flex gap-2 ">
              <div className="w-28 ">
                <img src={constants.carimg1} alt="hgfhjj" />
              </div>
              <div>
                <h3 className=" font-bold ml-2 text-black mr-2">
                  Godrive Mini
                </h3>
                <h4 className="ml-2">Comfortable Mini Cabs</h4>
              </div>
              <h1 className="flex mt-5 ml-4  text-black font-bold ">
                <FaRupeeSign className="mt-1" />
                550
              </h1>
            </div>
          </div>{" "}
          <div className="border border-black rounded-lg hover:shadow-lg mt-3 p-2  ">
            <div className=" flex gap-2 ">
              <div className="w-24 ">
                <img src={constants.auto6} alt="hgfhjj" />
              </div>
              <div>
                <h3 className=" font-bold ml-6 text-black mr-2">
                  Godrive Auto
                </h3>
                <h4 className="ml-6">Comfortable Drive auto</h4>
              </div>
              <h1 className="flex mt-5 ml-3 text-black font-bold ">
                <FaRupeeSign className="mt-1" />
                545
              </h1>
            </div>
          </div>{" "}
          <div className="border border-black rounded-lg hover:shadow-lg mt-3 p-2  ">
            <div className=" flex gap-2 ">
              <div className="w-28">
                <img src={constants.bike7} alt="hgfhjj" />
              </div>
              <div>
                <h3 className=" font-bold ml-2 text-black mr-2">
                  Godrive BikeTaxi
                </h3>
                <h4 className="ml-2">Comfortable BikeTaxi</h4>
              </div>
              <h1 className="flex mt-5 ml-7  text-black font-bold ">
                <FaRupeeSign className="mt-1" />
                250
              </h1>
            </div>
          </div>
          <div className=" flex items-center justify-between sticky bottom-0 p-3 hover:bg-white hover:shadow-lg border rounded-lg bg-gray-50">
            <div className="ml-3">
              <button
                onClick={() => handleThirdPopup()}
                className="flex mt-3 "
              >
                {selectedPayment ? (
                  <>
                    {/* Icon and selected payment */}
                    {selectedPayment === "GooglePay" && (
                      <FaGooglePay
                        className="text-red-600 mt-1 mr-2"
                        size={24}
                      />
                    )}
                    {selectedPayment === "PhonePay" && (
                      <SiPhonepe
                        className="text-violet-800 mt-1 mr-2"
                        size={24}
                      />
                    )}
                    {selectedPayment === "Cash" && (
                      <BsCashCoin
                        className="text-green-600 mt-1 mr-2"
                        size={24}
                      />
                    )}

                    {/* Selected Payment Name */}
                    {selectedPayment}
                  </>
                ) : (
                  <>
                    {/* Default to Cash when no payment is selected */}
                    <BsCashCoin
                      className="text-green-600 mt-1 mr-2"
                      size={24}
                    />
                    Cash
                  </>
                )}
                <RiArrowDropDownLine size={28} />
              </button>
            </div>
            <div>
              <button className="text-white bg-black mr-2 rounded-lg px-10 py-3 font-semibold">
                Request
              </button>
            </div>
          </div>
        </div>
        {isForm1Visible && (
          <form
            className={`lg:col-span-1 bg-white p-5 mt-6 h-96  w-[350px] lg:order-1  rounded-lg sm:order-2 shadow-lg sticky top-5 min-h-fit ${
              showForm ? "ml-10" : "ml-16"
            }`}
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Find a Trip
            </h2>
            <FormField
              label="Pickup location"
              value={pickupLocation}
              onChange={(e) =>
                handleLocationChange(e, setPickupLocation, setPickupSuggestions)
              }
              suggestions={pickupSuggestions}
              onSuggestionSelect={(suggestion) =>
                handleSuggestionSelect(
                  suggestion,
                  setPickupLocation,
                  setPickupSuggestions
                )
              }
              icon={<RiMapPinLine className="text-black" />}
            />
            <FormField
              label="Drop off location"
              value={dropLocation}
              onChange={(e) =>
                handleLocationChange(e, setDropLocation, setDropSuggestions)
              }
              suggestions={dropSuggestions}
              onSuggestionSelect={(suggestion) =>
                handleSuggestionSelect(
                  suggestion,
                  setDropLocation,
                  setDropSuggestions
                )
              }
              icon={<RiPinDistanceFill className="text-black" />}
            />

            <div className="flex flex-col gap-4">
              <button
                onClick={handlePickup}
                className="w-full pl-3 pr-3 py-2 flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-gray-700 text-sm transition-all duration-200 ease-in-out"
              >
                <FaClock className="text-black" />
                <span className="font-semibold text-black">{pickupTime}</span>
              </button>

              <button
                onClick={togglePopup}
                className="bg-gray-100 hover:bg-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black w-fit flex items-center gap-4 rounded-lg pl-2 pr-2 py-1 text-gray-700 text-sm transition-all duration-200 ease-in-out"
              >
                <RiUserAddFill className="text-black" />
                <span className="font-semibold text-black">For me</span>
                <RiArrowDropDownLine size={28} className="text-black" />
              </button>
            </div>

            <button
              onClick={handleSearch}
              className={`p-3 rounded-lg mt-4 w-full ${
                isSearchBtnDisabled
                  ? "bg-gray-400 opacity-50 cursor-not-allowed"
                  : "bg-black text-white"
              }`}
              disabled={isSearchBtnDisabled} // Button is disabled if fields are missing
              style={{
                pointerEvents: isSearchBtnDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "auto",
              }} // Prevent further mouse events after valid click
            >
              Search
            </button>
          </form>
        )}

        {isForm2Visible && (
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-1 bg-white p-5 h-96 w-90 lg:order-1 ml-16 rounded-lg sm:order-2 shadow-lg sticky top-5 min-h-fit overflow-y-auto"
          >
            {/* Sticky Header and Buttons */}
            <div className="relative">
              <IoClose
                className="text-xl cursor-pointer absolute top-2 right-2 z-10"
                onClick={() => closefourthPopup()}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-14 bg-gray-200 text-gray-700 px-3 py-1 rounded z-10"
              >
                Clear
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-700 pt-8">
                When do you want to be picked up?
              </h2>
            </div>

            {/* Date Input */}
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={pickupTime.date || ""}
                onChange={(e) =>
                  setPickupTime({ ...pickupTime, date: e.target.value })
                }
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>

            {/* Time Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={pickupTime.time || ""}
                onChange={(e) =>
                  setPickupTime({ ...pickupTime, time: e.target.value })
                }
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>

            {/* Info Section */}
            <h1 className="border p-3 mb-4">
              <BiSolidCalendarHeart className="inline-block mr-2" />
              Choose your pickup time up to 90 days in advance
            </h1>

            <h1 className="border p-3 mb-4">
              <GiSandsOfTime className="inline-block mr-2" />
              Extra wait time included to meet your ride
            </h1>

            <h1 className="border p-3 mb-4">
              <TiCancel className="inline-block mr-2" />
              Cancel at no charge up to 60 minutes in advance
            </h1>

            {/* Sticky Button */}
            <button
              type="submit"
              className="bg-black text-white text-s p-2 rounded w-full sticky bottom-0 mt-6 z-10"
            >
              Done
            </button>
          </form>
        )}
      </div>

      {/* Popup for "For Me" */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80 relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Trip Options</h4>
              <IoClose
                className="text-xl cursor-pointer"
                onClick={closePopup}
              />
            </div>
            <div className="mb-4">
              <div className="flex flex-col space-y-2">
                <label className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded">
                  <input
                    type="radio"
                    name="tripType"
                    value="For me"
                    checked={"Me"}
                    onChange={() => {
                      setForWhom("Me");
                      closePopup();
                    }}
                    className="mr-2"
                  />
                  Me
                </label>

                <label
                  onClick={() => {
                    setForWhom("");
                    toggleSecondPopup();
                  }}
                  className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded"
                >
                  <RiUserAddFill className="mr-2 text-lg" />
                  Order a Trip for someone else
                </label>
              </div>
              <button
                onClick={closePopup}
                className="bg-black text-white p-3 rounded-lg mt-4 w-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for "Order a Trip for someone else" */}
      {isSecondPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 relative">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-semibold">New rider</h4>
              <IoClose
                className="text-xl cursor-pointer"
                onClick={closeSecondPopup}
              />
            </div>
            <h6 className="text-lg font-semibold mb-2">
              Driver will see this name
            </h6>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                First Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Last Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden mb-4">
              <select
                value={countryCode}
                onChange={handleCountryCodeChange}
                className="bg-gray-100 border-r border-gray-300 p-2 rounded-l-lg"
              >
                <option value="+1">+1 (USA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (IN)</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Enter phone number"
                className="flex-1 p-2"
              />
            </div>
            <span className="text-sm font-semibold">
              GoDrive won't share this phone number with drivers
            </span>
            <button
              onClick={closeSecondPopup}
              disabled={isButtonDisabled}
              className={`bg-black text-white p-3 rounded-lg mt-4 w-full ${
                isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Add Rider
            </button>
          </div>
        </div>
      )}

      {/*popup for cash payment */}
      {thirdPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  shadow-lg  bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[400px]  h-[400px] ml-10 hover:bg-gray-50 relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Payment Options</h4>
              <IoClose
                className="text-xl cursor-pointer"
                onClick={closethirdPopup}
              />
            </div>
            <label className="flex items-center">
              <div
                for="Googlepay"
                className="flex justify-between  hover:bg-gray-100 w-full items-center border shadow-lg rounded-lg py-3 pr-4"
              >
                <FaGooglePay className="text-red-600 mt-1  w-32 h-8 "  />
                <span className="mr-44 "> GooglePay</span>

                <input
                  
                  type="radio"
                  name="paymentMethod"
                  value="GooglePay"
                  onChange={handlePaymentChange}
                  className="ml-4"
                />
              </div>
            </label>
            <label className="flex items-center">
              <div className="flex justify-between mt-3 hover:bg-gray- w-full items-center border shadow-lg rounded-lg p-4">
                <SiPhonepe className="text-violet-800 mt-1 mr-2" size={24} />
                <span className="mr-44">PhonePay</span>

                <input
                  type="radio"
                  name="paymentMethod"
                  value="PhonePay"
                  onChange={handlePaymentChange}
                  className="ml-4"
                />
              </div>
            </label>
            <label className="flex items-center">
              <div className="flex justify-between mt-3 hover:bg-gray-100 w-full items-center border shadow-lg rounded-lg p-4">
                <BsCashCoin className="text-green-600 mt-1 mr-2" size={24} />
                <span className="mr-[212px]  ">Cash</span>

                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash"
                  onChange={handlePaymentChange}
                  className="ml-4"
                />
              </div>
            </label>
            <div className="w-full flex justify-center">
              <button
                onClick={handlePaymentMethod}
                className="rounded-lg p-2 px-8 mt-10  shadow-lg text-white bg-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideForm;
