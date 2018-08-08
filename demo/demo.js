const
  { h, render, Component, createContext } = dio,

  PropTypes = {
    integer(props, key, componentName, location, propFullName) {
      return Number.isInteger(props[key])
        ? null
        : new Error('Property "' + propFullName + '" of ' + componentName + ' must be an integer');
    },

    string(props, key, componentName, location, propFullName) {
      return typeof props[key] === 'string'
        ? null
        : new Error('Property "' + propFullName + '" of ' + componentName + ' must be a string');
    },

    invalidResult() {
      return false;
    },

    unexpectedError() {
      throw 'Just a error simulation'
    }
  };

const DemoCtx = createContext(42);

DemoCtx.Provider.propTypes = {
  value: PropTypes.integer
};

class CounterInfo2 extends Component {
  render() {
    return h('span', ` ${this.props.value} `);
  }
}

const CounterInfo = function ({ value }) {
  return h('span', ` ${value} `);
} 

CounterInfo.displayName = 'CounterInfo';

CounterInfo.propTypes = {
  value: PropTypes.integer,
  dummy1: PropTypes.invalidResult,
  dummy2: PropTypes.unexpectedError,
  dummy3: 'this is not a validator'
};

class Counter extends Component {
  constructor() {
    super();
    this.state = { counterValue: 0 };
  }

  incrementCounter(delta) {
    this.setState({ counterValue: this.state.counterValue + delta });
  }

  render() {
    const counterValue = this.state.counterValue;

    return (
      h('div',
        h('label', this.props.label + ' '),
        h('button', { onClick: () => this.incrementCounter(-1) }, '-'),

        h(DemoCtx.Provider, { value: 'this will fail' },
          h(CounterInfo, { value: counterValue })),
        h('button', { onClick: () => this.incrementCounter(1) }, '+'))
    );
  }
}

Counter.displayName = 'Counter';

Counter.propTypes = {
  label: PropTypes.string,
  dummy: PropTypes.integer
}

render(
  h('section',
    h(Counter, { label: 'My counter:' })),
  document.getElementById('main-content'));
