export interface CartItemSubcategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}
export interface CartItemCategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
}
export interface CartItemBrand {
  _id: string;
  name: string;
  slug: string;
  image: string;
}
export interface CartItemProduct {
  subcategory: CartItemSubcategory[];
  _id: string;
  title: string;
  quantity: number;
  imageCover: string;
  category: CartItemCategory;
  brand: CartItemBrand;
  ratingsAverage: number;
  id: string;
}

export interface CartItem {
  count: number;
  _id: string;
  product: CartItemProduct;
  price: number;
}

export interface CartData {
  _id: string;
  cartOwner: string;
  products: CartItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalCartPrice: number;
}

export interface CartResponse {
  status: string;
  numOfCartItems: number;
  cartId: string;
  data: CartData;
}

export interface Address {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

export interface AddressesResponse {
  data: Address[];
}

export interface DecodedToken {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export interface UserTokenResponse {
  message: string;
  decoded: DecodedToken;
}

export interface UserData {
  data: {
    role: string;
    active: boolean;
    wishlist: string[];
    _id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    addresses: Address[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}
