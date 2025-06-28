import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart } from "./schemas/cart.schema";
import { CreateCartItemDto, UpdateCartItemDto } from "./dto/create-cart.dto";
const API_BASE_URL = process.env.API_BASE_URL || "http://192.168.77.44:5000";
import { Product } from "../product/schema/product.schema";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>
  ) {}

  async addToCart(userId: string, createCartItemDto: CreateCartItemDto) {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      const newCart = new this.cartModel({
        userId,
        items: [createCartItemDto],
      });
      return this.populateCartItems(await newCart.save());
    }

    const existingItem = cart.items.find(
      (item) => item.productId === createCartItemDto.productId
    );

    if (existingItem) {
      existingItem.quantity += createCartItemDto.quantity;
    } else {
      cart.items.push(createCartItemDto);
    }

    return this.populateCartItems(await cart.save());
  }

  async getCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      return { userId, items: [] };
    }
    return this.populateCartItems(cart);
  }

  async updateCartItem(
    userId: string,
    productId: string,
    updateCartItemDto: UpdateCartItemDto
  ) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const item = cart.items.find((item) => item.productId === productId);
    if (!item) {
      throw new Error("Item not found in cart");
    }

    item.quantity = updateCartItemDto.quantity;
    return this.populateCartItems(await cart.save());
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    return this.populateCartItems(await cart.save());
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );
    return this.populateCartItems(cart);
  }

  private async populateCartItems(cart: Cart) {
    console.log("populateCartItems - items reçus:", cart.items);
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.productModel.findById(item.productId);
        const result = {
          _id: item._id,
          productId: item.productId,
          quantity: item.quantity,
          product: product
            ? {
                _id: product._id,
                nom_product: product.nom_product,
                prix_detail: product.prix_detail,
                images: (product.images || []).map((img) =>
                  img
                    // 1) si l’API a déjà renvoyé un « http://localhost:5000 », on le remplace
                    .replace(/^http:\/\/localhost:5000/i, API_BASE_URL)
                    // 2) s’il ne reste qu’un chemin « /uploads/… », on préfixe avec l’URL
                    .replace(/^\/+/, `${API_BASE_URL}/`)
                ),
                disponibilite: product.disponibilite,
              }
            : null,
        };
        if (!product) {
          console.warn("Produit non trouvé pour productId:", item.productId);
        }
        return result;
      })
    );
    console.log("populateCartItems - items retournés:", populatedItems);
    return {
      userId: cart.userId,
      items: populatedItems.filter((item) => item.product !== null),
    };
  }
}
