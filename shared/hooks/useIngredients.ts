import React from "react";
import {Ingredient} from "@prisma/client";
import {API} from "@/shared/services/api-client";

export const useIngredients = () => {
    const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchIngredients() {
            try {
                setLoading(true);
                const response = await API.ingredients.getAllIngredients();
                setIngredients(response);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetchIngredients()
    }, []);

    return {ingredients, loading};
}