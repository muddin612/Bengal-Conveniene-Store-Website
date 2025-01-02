import { useState, useEffect } from "react";
import { Form, FormControl, Button, ListGroup } from "react-bootstrap";
import { supabase } from "../DB/supabaseClient";
import "../Components/CSS/SearchBar.css";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 1) {
        setSuggestions([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("product_name, product_category")
          .or(
            `product_name.ilike.%${searchTerm}%,product_category.ilike.%${searchTerm}%`
          )
          .limit(10);

        if (error) throw error;

        // Create unique suggestions combining products and categories
        const uniqueSuggestions = Array.from(
          new Set([
            ...data.map((item) => item.product_name),
            ...data.map((item) => item.product_category),
          ])
        ).filter(Boolean);

        setSuggestions(uniqueSuggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    // Debounce the search to avoid too many database calls
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search submission
    console.log("Searching for:", searchTerm);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="position-relative">
      <Form className="d-flex" onSubmit={handleSubmit}>
        <FormControl
          type="search"
          placeholder="Search Bengal Convenience"
          className="me-2"
          aria-label="Search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <Button
          variant="outline-light"
          type="submit"
          className="d-flex align-items-center"
        >
          Search
        </Button>
      </Form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ListGroup
          className="position-absolute w-100 mt-1 shadow-sm"
          style={{ zIndex: 1000 }}
        >
          {suggestions.map((suggestion, index) => (
            <ListGroup.Item
              key={index}
              action
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer"
            >
              {suggestion}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
