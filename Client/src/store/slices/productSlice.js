import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import axiosClient from "../../API/axiosClient";



export const getProducts = createAsyncThunk(
   "products/getProducts",
   async (_, { rejectWithValue }) => {
      try {
         const res = await axiosClient.get("/product");
         return res.data;
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || error.message || "Failed to fetch products"
         );
      }
   }
);

export const getProductById = createAsyncThunk(
   "products/getProductById",
   async (productId, { rejectWithValue }) => {
      try {
         const res = await axiosClient.get(`/product/${productId}`);
         return res.data;
      } catch (error) {
         return rejectWithValue(
            error.response?.data?.message || error.message || "Failed to fetch product"
         );
      }
   }
);


const initialState = {
   products: [],
   currentProduct: null,
   loading: false,
   productLoading: false,
   error: null,
   
   filters: {
      search: "",
      category: "ALL",
      status: "ALL",
      priceRange: [0, 200000],
      sortBy: "newest",
   },
};



const productSlice = createSlice({
   name: "products",
   initialState,
   reducers: {
      setSearchFilter: (state, action) => {
         state.filters.search = action.payload;
      },
      
      setCategoryFilter: (state, action) => {
         state.filters.category = action.payload;
      },
      
      setStatusFilter: (state, action) => {
         state.filters.status = action.payload;
      },
      
      setPriceRangeFilter: (state, action) => {
         state.filters.priceRange = action.payload;
      },
      
      setSortBy: (state, action) => {
         state.filters.sortBy = action.payload;
      },
      
      resetFilters: (state) => {
         state.filters = initialState.filters;
      },
      
      clearError: (state) => {
         state.error = null;
      },
      
      clearCurrentProduct: (state) => {
         state.currentProduct = null;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(getProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(getProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.products = action.payload;
         })
         .addCase(getProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })


         .addCase(getProductById.pending, (state) => {
            state.productLoading = true;
            state.error = null;
         })
         .addCase(getProductById.fulfilled, (state, action) => {
            state.productLoading = false;
            state.currentProduct = action.payload;
         })
         .addCase(getProductById.rejected, (state, action) => {
            state.productLoading = false;
            state.error = action.payload;
         });
   },
});


const selectProducts = (state) => state.products.products;
const selectFilters = (state) => state.products.filters;


export const selectFilteredProducts = createSelector(
   [selectProducts, selectFilters],
   (products, filters) => {
      let filtered = [...products];
      
      if (filters.search) {
         const searchLower = filters.search.toLowerCase();
         filtered = filtered.filter(
            (p) =>
               p.name.toLowerCase().includes(searchLower) ||
               p.description?.toLowerCase().includes(searchLower)
         );
      }
      
      if (filters.category !== "ALL") {
         filtered = filtered.filter((p) => (p.category || "General") === filters.category);
      }
      
      if (filters.status !== "ALL") {
         filtered = filtered.filter((p) => p.status === filters.status);
      }
      
      filtered = filtered.filter(
         (p) => p.finalPrice >= filters.priceRange[0] && p.finalPrice <= filters.priceRange[1]
      );
      
      switch (filters.sortBy) {
         case "price-low":
            filtered.sort((a, b) => a.finalPrice - b.finalPrice);
            break;
         case "price-high":
            filtered.sort((a, b) => b.finalPrice - a.finalPrice);
            break;
         case "rating":
            filtered.sort((a, b) => b.rating - a.rating);
            break;
         case "discount":
            filtered.sort((a, b) => b.discount - a.discount);
            break;
         case "newest":
         default:
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
      }
      
      return filtered;
   }
);

export const selectCategories = createSelector(
   [selectProducts],
   (products) => {
      const categories = new Set();
      products.forEach((product) => {
         const category = product.category || "General";
         categories.add(category);
      });
      return Array.from(categories);
   }
);

export const selectProductStats = createSelector(
   [selectProducts],
   (products) => {
      return {
         total: products.length,
         active: products.filter((p) => p.status === "ACTIVE").length,
         outOfStock: products.filter((p) => p.status === "OUT_OF_STOCK").length,
         avgDiscount: products.length
            ? (products.reduce((sum, p) => sum + p.discount, 0) / products.length).toFixed(1)
            : 0,
      };
   }
);

export const {
   setSearchFilter,
   setCategoryFilter,
   setStatusFilter,
   setPriceRangeFilter,
   setSortBy,
   resetFilters,
   clearError,
   clearCurrentProduct,
} = productSlice.actions;

export default productSlice.reducer;