import * as s from "serialijse";

class OrderModel {
  id: number;
  name: string;

  constructor(result: any = {}) {
    this.id = result.id;
    this.name = result.name;
  }
}

class CustomerModel {
  id: number;
  firstName: string;
  lastName: string;
  orders: OrderModel[] = [];

  constructor(result: any = {}) {
    this.id = result.id;
    this.firstName = result.firstName;
    this.lastName = result.lastName;
    this.orders = result.orders;
  }

  get name() {
    return `${this.firstName} ${this.lastName}`
  }

  get orderCount() {
    return this.orders.length;
  }
}

class StopModel {
  id: number;
  customer: CustomerModel;

  constructor(result: any = {}) {
    this.id = result.id;
    this.customer = result.customer;
  }
}

let stops = [
  new StopModel({
    id: 1,
    customer: new CustomerModel({
      id: 100,
      firstName: "John",
      lastName: "Doe",
      orders: [
        new OrderModel({
          id: 1000,
          name: "Thumb tacks"
        }),
        new OrderModel({
          id: 1001,
          name: "Stapler"
        }),
      ],
    }),
  }),
  new StopModel({
    id: 2,
    customer: new CustomerModel({
      id: 200,
      firstName: "Mary",
      lastName: "Jane",
      orders: [
        new OrderModel({
          id: 2000,
          name: "Shish kebab"
        }),
        new OrderModel({
          id: 2001,
          name: "Frankincense"
        }),
      ],
    }),
  })
];

s.declarePersistable(StopModel);
s.declarePersistable(CustomerModel);
s.declarePersistable(OrderModel);

const saved = s.serialize(stops);
const restored: StopModel[] = s.deserialize(saved);
console.log(saved);

console.log(`${saved.length} stops...`)

restored.map(stop => {
  console.log(`${stop.customer.name}: ${stop.customer.orderCount} orders`)
})