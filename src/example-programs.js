export const examplePrograms = [
  {
    name: 'Hello world',
    source: `print "hello world";
`,
  },
  {
    name: 'Fibonacci',
    source: `// Returns the nth Fibonacci number
fun fibonacci(n) {
  if (n == 0) {
    return 0;
  } else if (n == 1) {
    return 1;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}

print fibonacci(10);
print fibonacci(15);
`,
  },
  {
    name: 'Leibniz formula for π',
    source: `// Implements the Leibniz formula for π
// https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80
fun getPi(n) {
  var quarterPi = 0;
  for (var i = 0; i < n; i = i + 1) {
    quarterPi = quarterPi + getTerm(i);
  }
  return quarterPi * 4;
}

fun getTerm(n) {
  var sign = 1;
  for (var i = 0; i < n; i = i + 1) {
    sign = sign * -1;
  }
  return sign / ((2 * n) + 1);
}

print getPi(800);
`,
  },
  {
    name: 'Classes and Inheritance',
    source: `class Doughnut {
  cook() {
    print "Fry until golden brown.";
  }
}

class BostonCream < Doughnut {
  cook() {
    super.cook();
    print "Pipe full of custard and coat with chocolate.";
  }
}

BostonCream().cook();
`,
  },
];
