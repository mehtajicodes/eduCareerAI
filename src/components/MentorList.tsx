// "use client";

// import { useState, useEffect } from "react";
// import { Users, MessageSquare, Loader2 } from "lucide-react";
// import { PaymanClient } from "@paymanai/payman-ts";

// // Types
// interface Mentor {
//   id: string;
//   name: string;
//   role: string;
//   company: string;
//   rate: number;
//   availability: "Available" | "Booked";
//   walletAddress: string;
//   image: string;
// }

// // Constants
// const payman = PaymanClient.withCredentials({
//   clientId: process.env.NEXT_PUBLIC_PAYMAN_CLIENT_ID!,
//   clientSecret: process.env.NEXT_PUBLIC_PAYMAN_CLIENT_SECRET!,
// });

// export default function MentorList({ careerPath }: { careerPath: string }) {
//   // State
//   const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
//   const [isPaying, setIsPaying] = useState(false);
//   const [txHash, setTxHash] = useState<string | null>(null);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState({
//     title: "",
//     message: "",
//     type: "success",
//   });
//   const [mentors, setMentors] = useState<Mentor[]>([]);

//   // Toast helper
//   const showNotification = (title: string, message: string, type: "success" | "error") => {
//     setToastMessage({ title, message, type });
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 5000);
//   };

//   // Fetch payees from Payman
//   useEffect(() => {
//     const fetchPayees = async () => {
//       try {
//         const response = await payman.ask("List all payees");
        
//         // Log the entire raw response
//         console.log("Raw Payees Response:", JSON.stringify(response, null, 2));

//         // Check if 'artifacts' is present and not empty
//         if (!response || !Array.isArray(response.artifacts) || response.artifacts.length === 0) {
//           console.warn("No artifacts found in the response:", response);
//           showNotification("Error", "No payees data found.", "error");
//           return;
//         }

//         // Extract the content of the first artifact
//         const payeesContent = response.artifacts[0]?.content;
//         if (!payeesContent) {
//           console.warn("No content found in the first artifact:", response.artifacts);
//           showNotification("Error", "Invalid payees data format.", "error");
//           return;
//         }

//         // Log the raw content for inspection
//         console.log("Raw Payees Content:", payeesContent);

//         // Parse payees using regex to extract structured data
//         let parsedPayees: Mentor[] = [];
        
//         // Updated regex to match the provided structured payees content
//         const payeeRegex = /\d+\. Name: (.+?)\n\s+- Type: (.+?)\n\s+- Currency: (.+?)(?:\n\s+- Wallet Details:\n\s+\* Paytag: (.+?)\n\s+\* Wallet Name: (.+?)\n\s+\* Wallet Provider: (.+?)\n\s+\* Wallet ID: (.+?)\n\s+\* Organization Name: (.+?))?\n/g;
//         let match;

//         // Iterate over matches and parse data
//         while ((match = payeeRegex.exec(payeesContent)) !== null) {
//           console.log("Parsed Payee:", match); // Log each parsed payee

//           parsedPayees.push({
//             id: match[1].trim(),
//             name: match[1].trim(),
//             role: match[2].trim(),
//             company: match[8]?.trim() || "N/A", // Organization Name or default
//             rate: 2, // Default rate (adjust as needed)
//             availability: "Available", // Mark as available by default
//             walletAddress: match[7]?.trim() || "", // Wallet ID if available
//             image: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740", // Placeholder image
//           });
//         }

//         // Log all the parsed payees
//         console.log("Final Parsed Payees:", parsedPayees);

//         // Now filter the payees to match the specific names you are looking for
//         const filteredPayees = parsedPayees.filter(mentor => {
//           return ["anisha", "megha", "seema", "portal.dim.vow/51"].includes(mentor.name.toLowerCase());
//         });

//         console.log("Filtered Payees:", filteredPayees); // Log the filtered payees
//         setMentors(filteredPayees);

//       } catch (error: any) {
//         console.error("Error fetching or parsing payees:", error);
//         showNotification("Error", "Failed to fetch payees. Please try again later.", "error");
//       }
//     };

//     fetchPayees();
//   }, []);

//   // Payment handling
//   const handlePayment = async (mentor: Mentor) => {
//     setIsPaying(true);
//     setTxHash(null);

//     try {
//       const paymentResponse = await payman.ask(`Send ${mentor.rate} Tds to ${mentor.name}`);
//       console.log("Payment Response:", paymentResponse);

//       const transactionHash = paymentResponse?.transactionHash || "unknown";
//       setTxHash(transactionHash);

//       setMentors((prevMentors) =>
//         prevMentors.map((m) =>
//           m.id === mentor.id ? { ...m, availability: "Booked" } : m
//         )
//       );

//       showNotification("Payment Successful", "Your booking has been confirmed!", "success");
//       setSelectedMentor(null); // Close the modal after payment
//     } catch (error) {
//       console.error("Payment Error:", error);
//       showNotification("Payment Failed", "Transaction could not be completed. Please try again.", "error");
//     } finally {
//       setIsPaying(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
//       {/* Header */}
//       <div className="flex items-center justify-between p-6 border-b">
//         <div className="flex items-center gap-2">
//           <Users className="h-6 w-6 text-blue-600" />
//           <h2 className="text-xl font-bold">Available Mentors</h2>
//         </div>
//       </div>

//       {/* Mentor List */}
//       <div className="p-6 space-y-6">
//         {mentors.length === 0 && (
//           <div className="text-center text-gray-500">No mentors available at the moment.</div>
//         )}
//         {mentors.map((mentor) => (
//           <div
//             key={mentor.id}
//             className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:border-blue-100"
//           >
//             <img src={mentor.image || "/placeholder.svg"} alt={mentor.name} className="h-12 w-12 rounded-full" />
//             <div className="flex-1 space-y-1">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="font-semibold">{mentor.name}</h3>
//                   <p className="text-sm text-gray-600">
//                     {mentor.role} - {mentor.company}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between pt-2">
//                 <span className="text-sm font-medium">{mentor.rate} TDS/hour</span>
//                 <button
//                   onClick={() => setSelectedMentor(mentor)}
//                   disabled={mentor.availability !== "Available"}
//                   className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <MessageSquare className="h-4 w-4" />
//                   Book Session
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Payment Modal */}
//       {selectedMentor && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
//             <h3 className="text-xl font-bold mb-4">Confirm Booking</h3>
//             <p className="text-gray-600 mb-6">You're about to book a mentoring session</p>

//             <div className="space-y-4">
//               <div className="flex items-center gap-4 rounded-lg border p-4">
//                 <img
//                   src={selectedMentor.image || "/placeholder.svg"}
//                   alt={selectedMentor.name}
//                   className="h-12 w-12 rounded-full"
//                 />
//                 <div>
//                   <h4 className="font-semibold">{selectedMentor.name}</h4>
//                   <p className="text-sm text-gray-600">{selectedMentor.role}</p>
//                   <p className="text-sm text-gray-600">{selectedMentor.company}</p>
//                 </div>
//               </div>

//               <button
//                 onClick={() => handlePayment(selectedMentor)}
//                 disabled={isPaying}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white"
//               >
//                 {isPaying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Payment"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toast Notification */}
//       {showToast && (
//         <div
//           className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-6 p-4 rounded-lg ${
//             toastMessage.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
//           }`}
//         >
//           <strong className="font-semibold">{toastMessage.title}</strong>
//           <p>{toastMessage.message}</p>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Users, MessageSquare, Loader2 } from "lucide-react";
import { PaymanClient } from "@paymanai/payman-ts";

// Types
interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  rate: number;
  availability: "Available" | "Booked";
  walletAddress: string;
  image: string;
}

// Constants
const payman = PaymanClient.withCredentials({
  clientId: process.env.NEXT_PUBLIC_PAYMAN_CLIENT_ID!,
  clientSecret: process.env.NEXT_PUBLIC_PAYMAN_CLIENT_SECRET!,
});

export default function MentorList({ careerPath }: { careerPath: string }) {
  // State
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    message: "",
    type: "success",
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);

  // Toast helper
  const showNotification = (title: string, message: string, type: "success" | "error") => {
    setToastMessage({ title, message, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Fetch payees from Payman
  useEffect(() => {
    const fetchPayees = async () => {
      try {
        const response = await payman.ask("List all payees");
        
        // Log the entire raw response
        console.log("Raw Payees Response:", JSON.stringify(response, null, 2));

        // Check if 'artifacts' is present and not empty
        if (!response || !Array.isArray(response.artifacts) || response.artifacts.length === 0) {
          console.warn("No artifacts found in the response:", response);
          showNotification("Error", "No payees data found.", "error");
          return;
        }

        // Extract the content of the first artifact
        const payeesContent = response.artifacts[0]?.content;
        if (!payeesContent) {
          console.warn("No content found in the first artifact:", response.artifacts);
          showNotification("Error", "Invalid payees data format.", "error");
          return;
        }

        // Log the raw content for inspection
        console.log("Raw Payees Content:", payeesContent);

        // Parse payees using regex to extract structured data
        let parsedPayees: Mentor[] = [];
        
        // Updated regex to match the provided structured payees content
        const payeeRegex = /\d+\. Name: (.+?)\n\s+- Type: (.+?)\n\s+- Currency: (.+?)(?:\n\s+- Wallet Details:\n\s+\* Paytag: (.+?)\n\s+\* Wallet Name: (.+?)\n\s+\* Wallet Provider: (.+?)\n\s+\* Wallet ID: (.+?)\n\s+\* Organization Name: (.+?))?\n/g;
        let match;

        // Iterate over matches and parse data
        while ((match = payeeRegex.exec(payeesContent)) !== null) {
          console.log("Parsed Payee:", match); // Log each parsed payee

          parsedPayees.push({
            id: match[1].trim(),
            name: match[1].trim(),
            role: match[2].trim(),
            company: match[8]?.trim() || "N/A", // Organization Name or default
            rate: 2, // Default rate (adjust as needed)
            availability: "Available", // Mark as available by default
            walletAddress: match[7]?.trim() || "", // Wallet ID if available
            image: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740", // Placeholder image
          });
        }

        // Log all the parsed payees
        console.log("Final Parsed Payees:", parsedPayees);

        // Now filter the payees to match the specific names you are looking for
        const filteredPayees = parsedPayees.filter(mentor => {
          return ["anisha", "megha", "seema", "portal.dim.vow/51"].includes(mentor.name.toLowerCase());
        });

        console.log("Filtered Payees:", filteredPayees); // Log the filtered payees
        setMentors(filteredPayees);

      } catch (error: any) {
        console.error("Error fetching or parsing payees:", error);
        showNotification("Error", "Failed to fetch payees. Please try again later.", "error");
      }
    };

    fetchPayees();
  }, []);

  // Payment handling
  const handlePayment = async (mentor: Mentor) => {
    setIsPaying(true);
    setTxHash(null);

    try {
      const paymentResponse = await payman.ask(`Send ${mentor.rate} Tds to ${mentor.name}`);
      console.log("Payment Response:", paymentResponse);

      const transactionHash = paymentResponse?.transactionHash || "unknown";
      setTxHash(transactionHash);

      setMentors((prevMentors) =>
        prevMentors.map((m) =>
          m.id === mentor.id ? { ...m, availability: "Booked" } : m
        )
      );

      showNotification("Payment Successful", "Your booking has been confirmed!", "success");
      setSelectedMentor(null); // Close the modal after payment
    } catch (error) {
      console.error("Payment Error:", error);
      showNotification("Payment Failed", "Transaction could not be completed. Please try again.", "error");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold">Available Mentors</h2>
        </div>
      </div>

      {/* Mentor List */}
      <div className="p-6 space-y-6">
        {mentors.length === 0 && (
          <div className="text-center text-gray-500">No mentors available at the moment.</div>
        )}
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:border-blue-100"
          >
            <img src={mentor.image || "/placeholder.svg"} alt={mentor.name} className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{mentor.name}</h3>
                  <p className="text-sm text-gray-600">
                    {mentor.role} - {mentor.company}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium">{mentor.rate} TDS/hour</span>
                <button
                  onClick={() => setSelectedMentor(mentor)}
                  disabled={mentor.availability !== "Available"}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="h-4 w-4" />
                  Book Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Confirm Booking</h3>
            <p className="text-gray-600 mb-6">You're about to book a mentoring session</p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <img
                  src={selectedMentor.image || "/placeholder.svg"}
                  alt={selectedMentor.name}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <h4 className="font-semibold">{selectedMentor.name}</h4>
                  <p className="text-sm text-gray-600">{selectedMentor.role}</p>
                  <p className="text-sm text-gray-600">{selectedMentor.company}</p>
                </div>
              </div>

              <button
                onClick={() => handlePayment(selectedMentor)}
                disabled={isPaying}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                {isPaying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-6 p-4 rounded-lg ${
            toastMessage.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}
        >
          <strong className="font-semibold">{toastMessage.title}</strong>
          <p>{toastMessage.message}</p>
        </div>
      )}
    </div>
  );
}

