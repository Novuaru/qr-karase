import React from "react";

type Props = {
  restaurant: {
    id: string;
    name: string;
    logo_url: string;
  };
};

export const RestaurantCard = ({ restaurant }: Props) => {
  return (
    <div
      tabIndex={0}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl hover:shadow-4xl transition-shadow duration-500 cursor-pointer overflow-hidden border border-gray-700"
    >
      <div className="relative w-full h-64 sm:h-72 md:h-80">
        <img
          src={restaurant.logo_url}
          alt={`Logo ${restaurant.name}`}
          className="object-cover w-full h-full filter brightness-90 hover:brightness-110 transition duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-6 text-center">
        <h2 className="text-3xl font-serif font-semibold tracking-wide mb-2">
          {restaurant.name}
        </h2>
        <p className="text-sm text-gray-400 italic select-none">
          Nikmati kopi premium dan suasana nyaman.
        </p>
      </div>
    </div>
  );
};
