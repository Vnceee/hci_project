import { Router } from "express";
import { db, carsTable } from "@workspace/db";

const router = Router();

// Get all cars
router.get("/", async (req, res) => {
  try {
    const cars = await db.select().from(carsTable);
    res.json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

// Get car by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const car = await db
      .select()
      .from(carsTable)
      .where((t) => t.id === parseInt(id));
    
    if (car.length === 0) {
      return res.status(404).json({ error: "Car not found" });
    }
    
    res.json(car[0]);
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ error: "Failed to fetch car" });
  }
});

// Create new car
router.post("/", async (req, res) => {
  try {
    const { name, model, battery, range, temperature } = req.body;
    
    const result = await db
      .insert(carsTable)
      .values({ name, model, battery, range, temperature })
      .returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ error: "Failed to create car" });
  }
});

// Update car
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, battery, range, temperature } = req.body;
    
    const result = await db
      .update(carsTable)
      .set({ name, model, battery, range, temperature })
      .where((t) => t.id === parseInt(id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Car not found" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Failed to update car" });
  }
});

export default router;
