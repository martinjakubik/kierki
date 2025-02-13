This is an interesting way to make the GamePlay class abstract:

class Shape {
   constructor(name) {
      if(this.constructor == Shape) {
         throw new Error("Class is of abstract type and can't be instantiated");
      };

      if(this.getArea == undefined) {
          throw new Error("getArea method must be implemented");
      };
      this.name = name;
   }

}

... or, use typescript