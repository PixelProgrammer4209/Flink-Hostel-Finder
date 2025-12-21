import Image from "next/image";
import Link from "next/link"; // 1. Import Link

type HostelCardProps = {
  id: string; // 2. Add ID so we know which page to open
  image: string;
  name: string;
  type: "Boys" | "Girls";
  distance: string;
};

export default function HostelCard({
  id,
  image,
  name,
  type,
  distance,
}: HostelCardProps) {
  return (
    // 3. Wrap the whole card in a Link
    <Link href={`/hostel/${id}`} className="block group">
      <div className="bg-white text-gray-800 rounded-2xl shadow-lg overflow-hidden w-full hover:scale-105 transition-transform duration-300 border border-gray-100">
        
        {/* Hostel Image */}
        <div className="relative w-full h-56">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
          {/* Optional: Add a subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-3">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold line-clamp-1">{name}</h2>
            <span
              className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide ${
                type === "Boys"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-pink-100 text-pink-700"
              }`}
            >
              {type}
            </span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <span className="mr-2">📍</span>
            <span className="truncate">{distance} from college</span>
          </div>
          
          <div className="pt-2">
             <span className="text-indigo-600 font-medium text-sm group-hover:underline">
                View Details &rarr;
             </span>
          </div>
        </div>
      </div>
    </Link>
  );
}