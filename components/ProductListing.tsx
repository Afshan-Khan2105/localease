import React, { useState, useEffect, useRef, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { FaCamera, FaMicrophone, FaArrowUp } from "react-icons/fa"; // Removed FaArrowRight
import { getAllCategoriesClient } from "@/sanity/lib/products/getAllCategoriesClient";

const DRAFT_KEY = "findit-product-draft";

// Debounce utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: NodeJS.Timeout;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

type Category = {
  _id: string;
  title: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  image: File | null;
  images: File[];
  description: string;
  price: string;
  stock: string;
  categories: string[];
  location: { latitude?: number; longitude?: number };
  owner: {
    id: string;
    email: string;
  };
};

export default function ProductForm({ lat, lng }: { lat?: string; lng?: string }) {
  const { user, isSignedIn } = useUser();

  const [form, setForm] = useState<ProductFormState>({
    name: "",
    slug: "",
    image: null,
    images: [],
    description: "",
    price: "",
    stock: "",
    categories: [],
    location: lat && lng ? { latitude: parseFloat(lat), longitude: parseFloat(lng) } : {},
    owner: {
      id: user?.id || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
    },
  });

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<null | { success: boolean; product?: any; error?: string }>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showValidationError, setShowValidationError] = useState(false);

  // Debounced save to localStorage
  const debouncedSave = useRef(
    debounce((data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    }, 400)
  ).current;

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) setForm(JSON.parse(draft));
  }, []);

  // Save draft on form change (debounced)
  useEffect(() => {
    debouncedSave(form);
  }, [form, debouncedSave]);

  // Update owner info if user changes
  useEffect(() => {
    setForm(f => ({
      ...f,
      owner: {
        id: user?.id || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
      },
    }));
  }, [user]);

  // Fetch all categories
  useEffect(() => {
    getAllCategoriesClient().then((cats) =>
      setAllCategories(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cats.map((cat: any) => ({
          _id: cat._id,
          title: cat.title ?? "",
        }))
      )
    );
  }, []);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value, // Always store as string
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(f => ({ ...f, image: e.target.files![0] }));
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm(f => ({ ...f, images: Array.from(e.target.files!) }));
    }
  };

  const handleCategoryChange = (catId: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(catId)
        ? f.categories.filter(c => c !== catId)
        : [...f.categories, catId],
    }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    alert("Draft saved!");
  };

  const handleNewProduct = () => {
    setForm({
      name: "",
      slug: "",
      image: null,
      images: [],
      description: "",
      price: "",
      stock: "",
      categories: [],
      location: lat && lng ? { latitude: parseFloat(lat), longitude: parseFloat(lng) } : {},
      owner: {
        id: user?.id || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
      },
    });
    localStorage.removeItem(DRAFT_KEY);
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setSubmitResult({ success: false, error: "Please log in to post a product." });
      return;
    }
    if (!validateForm(form)) {
      setShowValidationError(true);
      return;
    }
    setSubmitting(true);
    setSubmitResult(null);

    let imageBase64 = null;
    if (form.image instanceof File) {
      imageBase64 = await toBase64(form.image);
    }

    const imagesBase64: string[] = [];
    for (const img of form.images) {
      if (img instanceof File) {
        imagesBase64.push(await toBase64(img));
      }
    }

    const data = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      image: imageBase64,
      images: imagesBase64,
    };

    const res = await fetch("/api/addProduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSubmitting(false);

    if (res.ok) {
      const result = await res.json();
      setSubmitResult({ success: true, product: result.product });
      localStorage.removeItem(DRAFT_KEY);
      handleNewProduct();
    } else {
      setSubmitResult({ success: false, error: "Failed! product Data Should be < 1MB" });
    }
  };

  // Generate slug from name
  const handleGenerateSlug = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setForm(f => ({
      ...f,
      slug: f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
    }));
  };

  // AI description generation states and refs
  const [showGen, setShowGen] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [recordedVoice, setRecordedVoice] = useState<{ text: string; duration: number } | null>(null);
  const [recordStart, setRecordStart] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Dummy AI API call (replace with your actual API/component)
  const fetchAIDescription = async (prompt: string) => {
    setGenLoading(true);
    // Replace with your actual API call
    const response = await fetch("/api/ai-description", {
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    setGenLoading(false);
    return data.description || "";
  };

  // Microphone handlers (Web Speech API, Chrome/Edge only)
  const handleMicStart = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    setMicActive(true);
    setRecordStart(Date.now());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const duration = recordStart ? Math.round((Date.now() - recordStart) / 1000) : 0;
      setRecordedVoice({ text: transcript, duration });
      setGenPrompt(transcript);
      setMicActive(false);
      setRecordStart(null);
    };
    recognition.onerror = () => {
      setMicActive(false);
      setRecordStart(null);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleMicStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setMicActive(false);
      setRecordStart(null);
    }
  };

  // Debounce search input for smoother filtering
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setCategorySearch(value);
    }, 120); // 120ms debounce
    setSearchTerm(value);
  };

  // Memoize filtered categories for performance
  const filteredCategories = useMemo(
    () =>
      allCategories.filter(
        cat =>
          cat.title.toLowerCase().includes(categorySearch.toLowerCase()) &&
          !form.categories.includes(cat._id)
      ),
    [allCategories, categorySearch, form.categories]
  );

  function validateForm(form: ProductFormState) {
    if (
      form.name.trim() === "" ||
      form.slug.trim() === "" ||
      !form.image ||
      form.description.trim() === "" ||
      form.price === "" ||
      form.stock === "" ||
      form.categories.length === 0 ||
      !form.owner.id ||
      !form.owner.email
    ) {
      return false;
    }
    return true;
  }

  return (
    <form
      className=" m-2 rounded-md shadow-xl border-2 border-gray-200 p-6 space-y-4"
      onSubmit={handleSubmit}
    >
      <h2 className="sm:text-2xl text-lg font-bold text-center mb-2">A New Product</h2>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1">
            <label className="block text-gray-700 mb-1">Product Name</label>
            <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 bg-gray-50"
            />
            </div>

            <div className="flex-1 items-center">
            <label className="block text-gray-700 mb-1">Product Slug</label>

            <div className="flex items-center">
            <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 bg-gray-50"
            />
            
            <button type="button" onClick={handleGenerateSlug}
            className="ml-2 px-3 py-1 lg:py-3 rounded bg-zinc-800 w-20 text-white hover:bg-zinc-900 text-xs"
            >
            <span>Gen-Slug</span>
            </button>
            </div>
            </div>
    
      </div>
      
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Single Product Image */}
        <div className="flex flex-col items-center">
          <label className="block text-gray-700 mb-2">Product Image</label>

          <div className="flex flex-col gap-2 ">
            {/* Blank image button */}
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-zinc-600 rounded cursor-pointer hover:border-zinc-800 transition relative">
              {form.image instanceof File ? (
                <div className="relative w-33 h-33">
                  <Image
                    src={URL.createObjectURL(form.image)}
                    alt="Product"
                    width={80}
                    height={80}
                    className="rounded"
                  />
                  {/* Cross button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setForm(f => ({ ...f, image: null }));
                    }}
                    className="absolute -top-4 -right-3 p-2 text-zinc-800 hover:text-red-300"
                    style={{ transform: "translate(48%,-40%)" }}
                    aria-label="Remove image"
                  >
                    &#10005;
                  </button>
                </div>
              ) : (
                <span className="text-zinc-400 text-xs text-center">
                  +<br />Insert<br />Image
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {/* Capture image button with camera icon */}
            <button
              type="button"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.capture = "environment";
                input.onchange = handleImageChange as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                input.style.display = "none";
                document.body.appendChild(input);
                input.click();
                input.addEventListener("change", () => {
                  document.body.removeChild(input);
                });
              }}
              className="px-2 py-1 h-8 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-900 flex items-center justify-center gap-1"
            >
              <FaCamera className="text-base" />
              <span>Capture</span>
            </button>
          </div>
        </div>

        {/* Multiple Product Images */}
        <div className="flex flex-col items-center">
          <label className="block text-gray-700 mb-2">Product Images (Multiple)</label>

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 flex-wrap items-center">
              {/* Blank image button for multiple */}
              <label className="flex flex-col items-center justify-center w-16 sm:w-32 h-16 sm:h-32 border-2 border-dashed border-zinc-600 rounded cursor-pointer hover:border-zinc-800 transition">
                <span className="text-zinc-400 text-xs text-center">
                  +<br />Insert<br />Images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                />
              </label>
              {/* Show selected images with cross button */}
              {form.images.length > 0 &&
                form.images.map((img, idx) => {
                  // Only show preview if img is a File
                  if (!(img instanceof File)) return null;
                  return (
                    <div key={idx} className="relative w-16 h-16 sm:w-32 sm:h-32">
                      <Image
                        src={URL.createObjectURL(img)}
                        alt={`Product ${idx + 1}`}
                        width={120}
                        height={120}
                        className="rounded"
                      />
                      {/* Cross button */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setForm(f => ({
                            ...f,
                            images: f.images.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="absolute z-50 -top-2 right-0 p-2 text-zinc-800 hover:text-red-300"
                        style={{ transform: "translate(48%,-40%)" }}
                        aria-label="Remove image"
                      >
                        &#10005;
                      </button>
                    </div>
                  );
                })}
            </div>
            {/* Capture images button with camera icon, placed below */}
            <button
              type="button"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.capture = "environment";
                input.multiple = true;
                input.onchange = handleImagesChange as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                input.click();
              }}
              className="px-2 py-1 h-8 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-900 flex items-center justify-center gap-1"
            >
              <FaCamera className="text-base" />
              <span>Capture</span>
            </button>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <label className="block text-gray-700 mb-1">Description</label>
          <button
            type="button"
            className="mb-1 px-2 py-1 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-900"
            onClick={() => setShowGen(v => !v)}
          >
            Generate
          </button>
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded px-3 py-2 bg-gray-50"
        />
        {showGen && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={genPrompt}
                onChange={e => setGenPrompt(e.target.value)}
                placeholder="Describe your product or speak..."
                className="flex-1 border text-sm sm:text-base rounded px-3 py-2 bg-gray-50"
              />
              <button
                type="button"
                className="absolute right-20 px-1 py-1 sm:px-3 sm:py-2 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-900 flex items-center justify-center"
                onClick={async () => {
                  if (!genPrompt.trim()) return;
                  const desc = await fetchAIDescription(genPrompt);
                  setForm(f => ({ ...f, description: desc }));
                }}
                disabled={genLoading}
              >
                {genLoading ? (
                  <svg className="animate-spin h-4 w-4  text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : (
                  <FaArrowUp size={15} className="text-base" />
                )}
              </button>
              <button
                type="button"
                className={`p-2 rounded-full ${micActive ? "bg-red-200" : "bg-zinc-200"} hover:bg-zinc-300`}
                onMouseDown={handleMicStart}
                onMouseUp={handleMicStop}
                onTouchStart={handleMicStart}
                onTouchEnd={handleMicStop}
                title="Hold to record"
              >
                <FaMicrophone className="text-zinc-800" />
              </button>
            </div>
            <div className="text-xs text-gray-400">
              Hold the mic to speak, or type a prompt and click Send. The generated description will appear above and can be edited.
            </div>
          </div>
        )}
        {micActive && (
          <div className="w-full flex items-center justify-center mt-2">
            <div className="flex  jus items-center gap-1 h-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-500 rounded-sm"
                  style={{
                    height: `${8 + Math.random() * 10}px`,
                    animation: "bounce 1s infinite alternate",
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            <style>{`
              @keyframes bounce {
                to { transform: scaleY(1.8); }
              }
            `}</style>
            <span className="ml-2  text-xs text-blue-400">Listening...</span>
          </div>
        )}
        {recordedVoice && (
          <div className="flex items-center gap-2 mt-2 bg-zinc-100 rounded px-3 py-2">
            <FaMicrophone className="text-zinc-800" />
            <span className="text-sm text-zinc-800">{recordedVoice.text}</span>
            <span className="text-xs text-zinc-500 ml-2">{recordedVoice.duration}s</span>
            <button
              type="button"
              className="ml-2 px-2 py-1 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-900 flex items-center"
              onClick={async () => {
                const desc = await fetchAIDescription(recordedVoice.text);
                setForm(f => ({ ...f, description: desc }));
                setRecordedVoice(null);
              }}
            >
              <FaArrowUp size={12} className="mr-1" /> Send
            </button>
            <button
              type="button"
              className="ml-1 text-zinc-400 hover:text-red-400"
              onClick={() => setRecordedVoice(null)}
              title="Discard"
            >
              &#10005;
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-gray-700 mb-1">Price (₹)</label>
          <input
            name="price"
            type="number"
            min={0}
            value={form.price}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 bg-gray-50"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 mb-1">Stock</label>
          <input
            name="stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 bg-gray-50"
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Categories</label>
        {/* Selected categories as chips */}
        <div className="flex flex-wrap gap-2 mb-2">
          {form.categories.map(catId => {
            const cat = allCategories.find(c => c._id === catId);
            if (!cat) return null;
            return (
              <span
                key={cat._id}
                className="flex items-center bg-zinc-800 text-white px-2 py-1 rounded-md text-xs cursor-pointer"
                onClick={() => {
                  handleCategoryChange(cat._id);
                  setCategorySearch("");
                  setSearchTerm("");
                  setDropdownOpen(false);
                }}
                title="Remove"
              >
                {cat.title}
                <span className="ml-1 text-zinc-300 hover:text-red-300">&times;</span>
              </span>
            );
          })}
        </div>
        {/* Dropdown search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            onChange={e => {
              handleCategorySearch(e);
              setDropdownOpen(true);
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filteredCategories.length > 0) {
                  handleCategoryChange(filteredCategories[0]._id);
                  setCategorySearch("");
                  setSearchTerm("");
                  setDropdownOpen(false);
                }
              }
            }}
            className="w-full border rounded px-3 py-2 bg-gray-50"
            autoComplete="off"
          />
          {dropdownOpen && (
            <div
              className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-40 overflow-y-auto"
            >
              {filteredCategories.length > 0 ? (
                filteredCategories.map(cat => (
                  <div
                    key={cat._id}
                    className="px-3 py-2 hover:bg-zinc-100 cursor-pointer"
                    onMouseDown={() => {
                      handleCategoryChange(cat._id);
                      setCategorySearch("");
                      setSearchTerm("");
                      setDropdownOpen(false);
                    }}
                  >
                    {cat.title}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-zinc-400">No categories found</div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Location display (readonly) */}
      <div>
        <label className="block text-gray-700 mb-1">Location (from map)</label>
        <div className="bg-gray-100 rounded px-3 py-2 text-sm">
          Lat: {lat}, Lng: {lng}
        </div>
      </div>
      {/* Owner info (readonly) */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-gray-700 mb-1">Owner ID</label>
          <input
            value={form.owner.id}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 mb-1">Owner Email</label>
          <input
            value={form.owner.email}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
      </div>
      <div className="flex gap-2 sm:justify-normal justify-center mt-4">
        <button
          type="button"
          onClick={handleNewProduct}
          className="px-4 py-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-900 transition"
        >
         Clear Details
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-4 py-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-900 transition"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          disabled={!isSignedIn}
          className={`px-4 py-2 rounded-md ${
            isSignedIn
              ? "bg-zinc-800 text-white hover:bg-zinc-900"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } transition`}
        >
          {isSignedIn ? "Post Product" : "Login to Post"}
        </button>
      </div>

      {/* Submission and loading indicators */}
      {submitting && (
  <div className="fixed -top-4 inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 m-2"></div>
      <span className="text-zinc-800 font-semibold">Posting your product...</span>
    </div>
  </div>
)}

{submitResult && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center max-w-md">
      {submitResult.success ? (
        <>
          <h3 className="text-lg font-bold mb-2 text-green-700">Product Posted!</h3>
          <div className="mb-2 font-semibold">{submitResult.product?.name}</div>
          <div className="mb-2 text-xs text-zinc-600">Slug: {submitResult.product?.slug?.current}</div>
          <div className="mb-2 text-xs text-zinc-600">Owner: {submitResult.product?.owner?.email}</div>
          <button
            className="mt-4 px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-900"
            onClick={() => setSubmitResult(null)}
          >
            OK
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold mb-2 text-red-700">Failed to Post Product</h3>
          <div className="mb-2 text-zinc-600">{submitResult.error}</div>
          <button
            className="mt-4 px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-900"
            onClick={() => setSubmitResult(null)}
          >
            OK
          </button>
        </>
      )}
    </div>
  </div>
)}

{showValidationError && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center max-w-md">
      <h3 className="text-lg font-bold mb-2 text-red-700">Complete the Details</h3>
      <div className="mb-2 text-zinc-600">Please fill all required fields before posting your product.</div>
      <button
        className="mt-4 px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-900"
        onClick={() => setShowValidationError(false)}
      >
        OK
      </button>
    </div>
  </div>
)}
    </form>
  );
}