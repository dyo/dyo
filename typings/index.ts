import {
  h, render, Context, Component, Children, Portal, Boundary, Suspense, Fragment, Node,
  useEffect, useMemo, useCallback, useRef, useState, useContext, useResource, useReducer
} from 'dyo'

{
function Provider({value, children}: {value: string, children: any}) {
  return h(Context, {value: 'value'}, children)
}

const value = useContext(Provider)
}

function Provider({value, children}: {value: string, children: any}) {
  return h(Context, {value: value}, children)
}

const a = h('button', {onClick: (event, props) => {

}}, 1)

render(1, '', (a) => {})

function Component<Props>(props: Props) {
  {
    const value = useContext(Provider)
    console.log(value)
  }

  Children.map([1], (a) => a)

  {
    useEffect(([a, b], props) => {
      const value = a + b
      console.log(value, props)
    }, [1, 2])
  }

  {
    const value = useMemo(([a, b]) => {
      return a + b
    }, [1, 2])

    console.log(value)
  }

  {
    const callback = useCallback<(a: number, b: number) => number>((a, b) => {
      return a + b
    })

    const value = callback(1, 2)

    console.log(value)
  }

  {
    const ref = useRef(1)
    const value = ref.current
    console.log(value)
  }

  {
    const ref = useRef(props => 1)
    const value = ref.current
    console.log(value)
  }

  {
    const [state, setState] = useState(1)
    setState(state + 1)
    console.log(state)
  }

  {
    const [state, setState] = useState(props => 1)
    setState(state => state + 1)
    console.log(state)
  }

  {
    const [state, dispatch] = useReducer((state, action) => state, 1)
    dispatch(state + 1)
    console.log(state)
  }

  {
    const value = useResource<number>(props => fetch('./'))
    console.log(value)
  }

  return h('h1', {}, 1, 2)
}
