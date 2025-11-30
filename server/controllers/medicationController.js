// controllers/medicationController.js
import Medication from '../models/Medication.js'; // Assurez-vous d'importer votre modèle Mongoose

// @route   POST /api/medications
// @desc    Ajouter un nouveau médicament
// @access  Private
const addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, instructions } = req.body;
    
    const newMedication = new Medication({
      userId: req.userId, // Récupéré par le middleware 'protect'
      name,
      dosage,
      frequency,
      instructions,
      isActive: true,
      startDate: new Date(),
    });

    const createdMedication = await newMedication.save();
    res.status(201).json(createdMedication);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du médicament.' });
  }
};

// @route   GET /api/medications
// @desc    Récupérer les médicaments de l'utilisateur
// @access  Private
const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.userId, isActive: true });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des médicaments.' });
  }
};

export { addMedication, getMedications };