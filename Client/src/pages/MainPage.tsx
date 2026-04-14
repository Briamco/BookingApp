import PropertyMap from "../components/PropertyMap"

function MainPage() {
  return (
    <div className="flex">
      <h1 className="text-3xl w-full font-bold mb-6">Encuentra tu próximo destino</h1>

      <div className="w-400 h-200 rounded-4xl overflow-hidden shadow-2xl border border-base-300">
        <PropertyMap properties={[]} />
      </div>
    </div>
  )
}

export default MainPage