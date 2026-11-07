import { Link } from "react-router-dom";

const categories = [
  { id: 1, name: "English", icon: "📘" },
  { id: 2, name: "Hindi", icon: "📕" },
  { id: 3, name: "Mathematics", icon: "📐" },
  { id: 4, name: "History", icon: "🏛️" },
  { id: 5, name: "Civics", icon: "⚖️" },
  { id: 6, name: "Geography", icon: "🌍" },
];

const CategorySection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">

      <h2 className="text-3xl font-bold text-center mb-10">
        Explore Subjects
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/books?subject=${encodeURIComponent(category.name)}`}
            className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
          >
            <div className="text-5xl mb-4">
              {category.icon}
            </div>

            <h3 className="text-xl font-semibold text-gray-800">
              {category.name}
            </h3>
          </Link>
        ))}

      </div>
    </section>
  );
};

export default CategorySection;