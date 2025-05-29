const GardenLog = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await plantAPI.get('/plants'); // Adjust endpoint as needed
        setPlants(response.data || []);
      } catch (error) {
        console.error('Failed to fetch plant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const handleNotesUpdate = async (plantId, updatedNotes) => {
    try {
      await plantAPI.put(`/plants/${plantId}`, { notes: updatedNotes });
      setPlants((prevPlants) =>
        prevPlants.map((plant) =>
          plant._id === plantId || plant.id === plantId
            ? { ...plant, notes: updatedNotes }
            : plant
        )
      );
    } catch (error) {
      console.error('Failed to update plant notes:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Garden</h1>
          <img src={LogoOJT} alt="Logo" className="h-10" />
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-20">
            <Loader className="animate-spin text-green-500" size={40} />
          </div>
        ) : plants.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">No plants found in your garden.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <PlantLogCard key={plant._id || plant.id} plant={plant} onNotesUpdate={handleNotesUpdate} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GardenLog;
