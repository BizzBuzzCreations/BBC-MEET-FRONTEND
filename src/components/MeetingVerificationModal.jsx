import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export default function MeetingVerificationModal({
  meeting,
  onClose,
  onVerified,
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(1);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const fileInputRef = useRef(null);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleVerify = async () => {
    if (step === 1) {
      if (otp.length < 6) {
        setError("OTP must be 6 digits");
        return;
      }

      setVerifying(true);
      setError("");

      try {
        await api.markCompleted(meeting.uid, otp);
        setStep(2);
      } catch (err) {
        setError(err.message || "Invalid OTP");
      } finally {
        setVerifying(false);
      }
      return;
    }

    // Step 2
    if (!imageFile) {
      setError("Please upload a photo to finish");
      return;
    }
    const res = await api.uploadPhoto(meeting.uid, imageFile);
    // Yaha agar backend pe upload karna ho to imageFile send kar sakte ho

    if (onVerified) onVerified(meeting.id);
    onClose();
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    setImageFile(file);
    setCapturedImage(URL.createObjectURL(file));
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-gray-950 w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">{meeting?.title}</h2>
          <button onClick={onClose} disabled={step === 2}>
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* STEP 1 */}
          {step === 1 ? (
            <>
              <div className="text-center">
                <h3 className="text-lg font-bold">Enter OTP</h3>
                <p className="text-sm text-gray-500">
                  Please enter the 6-digit code.
                </p>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full text-center text-3xl font-bold tracking-widest py-5 bg-gray-100 border-2 rounded-2xl outline-none"
              />

              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}
            </>
          ) : (
            /* STEP 2 */
            <>
              <div className="text-center">
                <h3 className="text-lg font-bold">Upload Image</h3>
                <p className="text-sm text-gray-500">
                  Upload attendee photo from your device.
                </p>
              </div>

              <div className="aspect-video bg-gray-100 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold"
                  >
                    Upload Photo
                  </button>
                )}

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {capturedImage && (
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-2 text-blue-600 text-sm underline"
                >
                  Change Photo
                </button>
              )}

              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-4">
          {step === 2 && (
            <button
              onClick={() => {
                setStep(1);
                setCapturedImage(null);
                setImageFile(null);
              }}
              className="flex-1 py-3 text-gray-500"
            >
              Back
            </button>
          )}

          <button
            onClick={handleVerify}
            disabled={
              verifying ||
              (step === 1 && otp.length < 6) ||
              (step === 2 && !imageFile)
            }
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            {verifying
              ? "Verifying..."
              : step === 1
                ? "Continue"
                : "Complete Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
