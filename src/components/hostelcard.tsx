import Image from "next/image";

type HostelCardProps = {
  image: string;
  name: string;
  type: "Boys" | "Girls";
  distance: string;
};

export default function HostelCard({
  image,
  name,
  type,
  distance,
}: HostelCardProps) {
  return (
    <div className="bg-white text-gray-800 rounded-2xl shadow-lg overflow-hidden w-80 hover:scale-105 transition-transform duration-300">
      
      {/* Hostel Image */}
      <div className="relative w-full h-48">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-2">
        <h2 className="text-xl font-bold">{name}</h2>

        <div className="flex items-center justify-between text-sm">
          <span
            className={`px-3 py-1 rounded-full font-semibold ${
              type === "Boys"
                ? "bg-blue-100 text-blue-700"
                : "bg-pink-100 text-pink-700"
            }`}
          >
            {type} Hostel
          </span>

          <span className="text-gray-600">
            📍 {distance} from college
          </span>
        </div>
      </div>
    </div>
  );
}
