import { expect, test } from "bun:test";
import { Model, Orb } from '../src/index'

let Person = Model({
  name: 'George Washington',
  age: 291,
  birthday(a,b){
    return this.age++
  }
})

let pz = new Person()

test('Model instanceof', () => {
  expect(Person instanceof Model).toBe(true)
  expect(Person instanceof Orb).toBe(false)
  expect(Person instanceof Person).toBe(false)

  expect(Model instanceof Orb).toBe(false)
})

test('Orb instanceof', () => {
  expect(pz instanceof Model).toBe(false)
  expect(pz instanceof Orb).toBe(true)
  expect(pz instanceof Person).toBe(true)


  expect(Orb instanceof Model).toBe(false)
})