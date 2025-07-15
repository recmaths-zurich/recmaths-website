function sigmoid(t) {
  return 1 / (1 + Math.pow(Math.E, -t));
}

function Node(layer, previous_row) {
  this.output = 0.0
  this.weights = []
  this.layer = layer

  for (let i = 0; i < previous_row.length; i++) {
    this.weights.push(Math.random())
  }

  this.fire = function(previous_row) {
    let cumulative_weight = 0.0
    for (let i = 0; i < previous_row.length; i++) {
      let combined = previous_row[i].output * this.weights[i]
      cumulative_weight += combined
    }
    let average = cumulative_weight / previous_row.length
    this.output = sigmoid(average)
  }

}

function makeTransferNodes(nodes) {
  let new_nodes = []
  for (let i = 0; i < nodes.length; i++) {
    let new_row = []
    for (let j = 0; j < nodes[i].length; j++) {
      let temp_new_node = {
        output: nodes[i][j].output,
        weights: nodes[i][j].weights,
        layer: nodes[i][j].layer
      }
      new_row.push(temp_new_node)
    }
    new_nodes.push(new_row)
  }
  return new_nodes
}

function NeuralNet(nodes) {
  this.nodes = []

  this.backpropagation = function(expected) {

    function derivative(output) {
      return output * (1.0 - output)
    }

    for (let i = this.nodes.length - 1; i >= 0; i--) {
      let layer = this.nodes[i]
      let errors = []
      if (i != this.nodes.length - 1) {
        for (let j = 0; j < layer.length; j++) {
          let error = 0.0
          for (let k = 0; k < this.nodes[i + 1].length; k++) {
            let neuron = this.nodes[i + 1][k]
            error += neuron.weights[j] * neuron.delta
          }
          errors.push(error)
        }
      } else {
        for (let j = 0; j < layer.length; j++) {
          let neuron = layer[j]
          errors.push(expected[j] - neuron.output)
        }
      }
      for (let j = 0; j < layer.length; j++) {
        let neuron = this.nodes[i][j]
        neuron.delta = errors[j] * derivative(neuron.output)
      }
    }
  }

  this.update_weights = function(learning_rate) {
    for (let i = 1; i < this.nodes.length; i++) {
      let inputs = []
      for (let j = 0; j < this.nodes[i - 1].length; j++)
        inputs.push(this.nodes[i - 1][j].output)
      for (let j = 0; j < this.nodes[i].length; j++) {
        for (let k = 0; k < inputs.length; k++) {
          this.nodes[i][j].weights[k] += learning_rate * this.nodes[i][j].delta * inputs[k]
        }
      }
    }
  }

  this.train = function(inputs, expected, cycles=200, learning_rate=0.5) {
    for (let i = 0; i < cycles; i++) {
      for (let j = 0; j < inputs.length; j++) {
        let outputs = this.input(inputs[j])
        this.backpropagation(expected[j])
        this.update_weights(learning_rate)
      }
    }
  }

  this.input = function(input_arr) {
    if (input_arr.length != this.nodes[0].length) {
      console.log("INP-ARR", input_arr)
      throw "Input Array must be same size as Input Neuron Layer"
    }
    for (let i = 0; i < input_arr.length; i++) {
      this.nodes[0][i].output = input_arr[i]
    }

    this.fire()

    let output = []
    for (let i = 0; i < this.nodes[this.nodes.length - 1].length; i++) {
      output.push(this.nodes[this.nodes.length - 1][i].output)
    }
    return output
  }

  this.fire = function() {
    for (let i = 1; i < this.nodes.length; i++) {
      let previous_row = this.nodes[i - 1]
      for (let j = 0; j < this.nodes[i].length; j++) {
        this.nodes[i][j].fire(previous_row)
      }
    }
  }

  let previous_row = []
  for (let i = 0; i < nodes.length; i++) {
    let new_row = []
    for (let j = 0; j < nodes[i]; j++) {
      let new_node = new Node(i, previous_row)
      new_row.push(new_node)
    }
    previous_row = new_row
    this.nodes.push(new_row)
  }
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}