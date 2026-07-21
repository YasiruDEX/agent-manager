import { a as __toESM } from "../__23tanstack-start-server-fn-resolver-BaOM1vmh.mjs";
import { o as require_react } from "./@emotion/react+[...].mjs";
import { a as _extends, i as _objectWithoutPropertiesLoose, n as _assertThisInitialized, r as _inheritsLoose } from "./babel__runtime.mjs";
import { o as require_react_dom } from "./mui__x-virtualizer+react-dom.mjs";
//#region node_modules/react-transition-group/esm/config.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var config_default = { disabled: false };
//#endregion
//#region node_modules/react-transition-group/esm/TransitionGroupContext.js
var TransitionGroupContext_default = import_react.createContext(null);
//#endregion
//#region node_modules/react-transition-group/esm/utils/reflow.js
var forceReflow = function forceReflow(node) {
	return node.scrollTop;
};
//#endregion
//#region node_modules/react-transition-group/esm/Transition.js
var UNMOUNTED = "unmounted";
var EXITED = "exited";
var ENTERING = "entering";
var ENTERED = "entered";
var EXITING = "exiting";
/**
* The Transition component lets you describe a transition from one component
* state to another _over time_ with a simple declarative API. Most commonly
* it's used to animate the mounting and unmounting of a component, but can also
* be used to describe in-place transition states as well.
*
* ---
*
* **Note**: `Transition` is a platform-agnostic base component. If you're using
* transitions in CSS, you'll probably want to use
* [`CSSTransition`](https://reactcommunity.org/react-transition-group/css-transition)
* instead. It inherits all the features of `Transition`, but contains
* additional features necessary to play nice with CSS transitions (hence the
* name of the component).
*
* ---
*
* By default the `Transition` component does not alter the behavior of the
* component it renders, it only tracks "enter" and "exit" states for the
* components. It's up to you to give meaning and effect to those states. For
* example we can add styles to a component when it enters or exits:
*
* ```jsx
* import { Transition } from 'react-transition-group';
*
* const duration = 300;
*
* const defaultStyle = {
*   transition: `opacity ${duration}ms ease-in-out`,
*   opacity: 0,
* }
*
* const transitionStyles = {
*   entering: { opacity: 1 },
*   entered:  { opacity: 1 },
*   exiting:  { opacity: 0 },
*   exited:  { opacity: 0 },
* };
*
* const Fade = ({ in: inProp }) => (
*   <Transition in={inProp} timeout={duration}>
*     {state => (
*       <div style={{
*         ...defaultStyle,
*         ...transitionStyles[state]
*       }}>
*         I'm a fade Transition!
*       </div>
*     )}
*   </Transition>
* );
* ```
*
* There are 4 main states a Transition can be in:
*  - `'entering'`
*  - `'entered'`
*  - `'exiting'`
*  - `'exited'`
*
* Transition state is toggled via the `in` prop. When `true` the component
* begins the "Enter" stage. During this stage, the component will shift from
* its current transition state, to `'entering'` for the duration of the
* transition and then to the `'entered'` stage once it's complete. Let's take
* the following example (we'll use the
* [useState](https://reactjs.org/docs/hooks-reference.html#usestate) hook):
*
* ```jsx
* function App() {
*   const [inProp, setInProp] = useState(false);
*   return (
*     <div>
*       <Transition in={inProp} timeout={500}>
*         {state => (
*           // ...
*         )}
*       </Transition>
*       <button onClick={() => setInProp(true)}>
*         Click to Enter
*       </button>
*     </div>
*   );
* }
* ```
*
* When the button is clicked the component will shift to the `'entering'` state
* and stay there for 500ms (the value of `timeout`) before it finally switches
* to `'entered'`.
*
* When `in` is `false` the same thing happens except the state moves from
* `'exiting'` to `'exited'`.
*/
var Transition = /*#__PURE__*/ function(_React$Component) {
	_inheritsLoose(Transition, _React$Component);
	function Transition(props, context) {
		var _this = _React$Component.call(this, props, context) || this;
		var parentGroup = context;
		var appear = parentGroup && !parentGroup.isMounting ? props.enter : props.appear;
		var initialStatus;
		_this.appearStatus = null;
		if (props.in) if (appear) {
			initialStatus = EXITED;
			_this.appearStatus = ENTERING;
		} else initialStatus = ENTERED;
		else if (props.unmountOnExit || props.mountOnEnter) initialStatus = UNMOUNTED;
		else initialStatus = EXITED;
		_this.state = { status: initialStatus };
		_this.nextCallback = null;
		return _this;
	}
	Transition.getDerivedStateFromProps = function getDerivedStateFromProps(_ref, prevState) {
		if (_ref.in && prevState.status === "unmounted") return { status: EXITED };
		return null;
	};
	var _proto = Transition.prototype;
	_proto.componentDidMount = function componentDidMount() {
		this.updateStatus(true, this.appearStatus);
	};
	_proto.componentDidUpdate = function componentDidUpdate(prevProps) {
		var nextStatus = null;
		if (prevProps !== this.props) {
			var status = this.state.status;
			if (this.props.in) {
				if (status !== "entering" && status !== "entered") nextStatus = ENTERING;
			} else if (status === "entering" || status === "entered") nextStatus = EXITING;
		}
		this.updateStatus(false, nextStatus);
	};
	_proto.componentWillUnmount = function componentWillUnmount() {
		this.cancelNextCallback();
	};
	_proto.getTimeouts = function getTimeouts() {
		var timeout = this.props.timeout;
		var exit = enter = appear = timeout, enter, appear;
		if (timeout != null && typeof timeout !== "number") {
			exit = timeout.exit;
			enter = timeout.enter;
			appear = timeout.appear !== void 0 ? timeout.appear : enter;
		}
		return {
			exit,
			enter,
			appear
		};
	};
	_proto.updateStatus = function updateStatus(mounting, nextStatus) {
		if (mounting === void 0) mounting = false;
		if (nextStatus !== null) {
			this.cancelNextCallback();
			if (nextStatus === "entering") {
				if (this.props.unmountOnExit || this.props.mountOnEnter) {
					var node = this.props.nodeRef ? this.props.nodeRef.current : import_react_dom.default.findDOMNode(this);
					if (node) forceReflow(node);
				}
				this.performEnter(mounting);
			} else this.performExit();
		} else if (this.props.unmountOnExit && this.state.status === "exited") this.setState({ status: UNMOUNTED });
	};
	_proto.performEnter = function performEnter(mounting) {
		var _this2 = this;
		var enter = this.props.enter;
		var appearing = this.context ? this.context.isMounting : mounting;
		var _ref2 = this.props.nodeRef ? [appearing] : [import_react_dom.default.findDOMNode(this), appearing], maybeNode = _ref2[0], maybeAppearing = _ref2[1];
		var timeouts = this.getTimeouts();
		var enterTimeout = appearing ? timeouts.appear : timeouts.enter;
		if (!mounting && !enter || config_default.disabled) {
			this.safeSetState({ status: ENTERED }, function() {
				_this2.props.onEntered(maybeNode);
			});
			return;
		}
		this.props.onEnter(maybeNode, maybeAppearing);
		this.safeSetState({ status: ENTERING }, function() {
			_this2.props.onEntering(maybeNode, maybeAppearing);
			_this2.onTransitionEnd(enterTimeout, function() {
				_this2.safeSetState({ status: ENTERED }, function() {
					_this2.props.onEntered(maybeNode, maybeAppearing);
				});
			});
		});
	};
	_proto.performExit = function performExit() {
		var _this3 = this;
		var exit = this.props.exit;
		var timeouts = this.getTimeouts();
		var maybeNode = this.props.nodeRef ? void 0 : import_react_dom.default.findDOMNode(this);
		if (!exit || config_default.disabled) {
			this.safeSetState({ status: EXITED }, function() {
				_this3.props.onExited(maybeNode);
			});
			return;
		}
		this.props.onExit(maybeNode);
		this.safeSetState({ status: EXITING }, function() {
			_this3.props.onExiting(maybeNode);
			_this3.onTransitionEnd(timeouts.exit, function() {
				_this3.safeSetState({ status: EXITED }, function() {
					_this3.props.onExited(maybeNode);
				});
			});
		});
	};
	_proto.cancelNextCallback = function cancelNextCallback() {
		if (this.nextCallback !== null) {
			this.nextCallback.cancel();
			this.nextCallback = null;
		}
	};
	_proto.safeSetState = function safeSetState(nextState, callback) {
		callback = this.setNextCallback(callback);
		this.setState(nextState, callback);
	};
	_proto.setNextCallback = function setNextCallback(callback) {
		var _this4 = this;
		var active = true;
		this.nextCallback = function(event) {
			if (active) {
				active = false;
				_this4.nextCallback = null;
				callback(event);
			}
		};
		this.nextCallback.cancel = function() {
			active = false;
		};
		return this.nextCallback;
	};
	_proto.onTransitionEnd = function onTransitionEnd(timeout, handler) {
		this.setNextCallback(handler);
		var node = this.props.nodeRef ? this.props.nodeRef.current : import_react_dom.default.findDOMNode(this);
		var doesNotHaveTimeoutOrListener = timeout == null && !this.props.addEndListener;
		if (!node || doesNotHaveTimeoutOrListener) {
			setTimeout(this.nextCallback, 0);
			return;
		}
		if (this.props.addEndListener) {
			var _ref3 = this.props.nodeRef ? [this.nextCallback] : [node, this.nextCallback], maybeNode = _ref3[0], maybeNextCallback = _ref3[1];
			this.props.addEndListener(maybeNode, maybeNextCallback);
		}
		if (timeout != null) setTimeout(this.nextCallback, timeout);
	};
	_proto.render = function render() {
		var status = this.state.status;
		if (status === "unmounted") return null;
		var _this$props = this.props, children = _this$props.children;
		_this$props.in;
		_this$props.mountOnEnter;
		_this$props.unmountOnExit;
		_this$props.appear;
		_this$props.enter;
		_this$props.exit;
		_this$props.timeout;
		_this$props.addEndListener;
		_this$props.onEnter;
		_this$props.onEntering;
		_this$props.onEntered;
		_this$props.onExit;
		_this$props.onExiting;
		_this$props.onExited;
		_this$props.nodeRef;
		var childProps = _objectWithoutPropertiesLoose(_this$props, [
			"children",
			"in",
			"mountOnEnter",
			"unmountOnExit",
			"appear",
			"enter",
			"exit",
			"timeout",
			"addEndListener",
			"onEnter",
			"onEntering",
			"onEntered",
			"onExit",
			"onExiting",
			"onExited",
			"nodeRef"
		]);
		return /*#__PURE__*/ import_react.createElement(TransitionGroupContext_default.Provider, { value: null }, typeof children === "function" ? children(status, childProps) : import_react.cloneElement(import_react.Children.only(children), childProps));
	};
	return Transition;
}(import_react.Component);
Transition.contextType = TransitionGroupContext_default;
Transition.propTypes = {};
function noop() {}
Transition.defaultProps = {
	in: false,
	mountOnEnter: false,
	unmountOnExit: false,
	appear: false,
	enter: true,
	exit: true,
	onEnter: noop,
	onEntering: noop,
	onEntered: noop,
	onExit: noop,
	onExiting: noop,
	onExited: noop
};
Transition.UNMOUNTED = UNMOUNTED;
Transition.EXITED = EXITED;
Transition.ENTERING = ENTERING;
Transition.ENTERED = ENTERED;
Transition.EXITING = EXITING;
//#endregion
//#region node_modules/react-transition-group/esm/utils/ChildMapping.js
/**
* Given `this.props.children`, return an object mapping key to child.
*
* @param {*} children `this.props.children`
* @return {object} Mapping of key to child
*/
function getChildMapping(children, mapFn) {
	var mapper = function mapper(child) {
		return mapFn && (0, import_react.isValidElement)(child) ? mapFn(child) : child;
	};
	var result = Object.create(null);
	if (children) import_react.Children.map(children, function(c) {
		return c;
	}).forEach(function(child) {
		result[child.key] = mapper(child);
	});
	return result;
}
/**
* When you're adding or removing children some may be added or removed in the
* same render pass. We want to show *both* since we want to simultaneously
* animate elements in and out. This function takes a previous set of keys
* and a new set of keys and merges them with its best guess of the correct
* ordering. In the future we may expose some of the utilities in
* ReactMultiChild to make this easy, but for now React itself does not
* directly have this concept of the union of prevChildren and nextChildren
* so we implement it here.
*
* @param {object} prev prev children as returned from
* `ReactTransitionChildMapping.getChildMapping()`.
* @param {object} next next children as returned from
* `ReactTransitionChildMapping.getChildMapping()`.
* @return {object} a key set that contains all keys in `prev` and all keys
* in `next` in a reasonable order.
*/
function mergeChildMappings(prev, next) {
	prev = prev || {};
	next = next || {};
	function getValueForKey(key) {
		return key in next ? next[key] : prev[key];
	}
	var nextKeysPending = Object.create(null);
	var pendingKeys = [];
	for (var prevKey in prev) if (prevKey in next) {
		if (pendingKeys.length) {
			nextKeysPending[prevKey] = pendingKeys;
			pendingKeys = [];
		}
	} else pendingKeys.push(prevKey);
	var i;
	var childMapping = {};
	for (var nextKey in next) {
		if (nextKeysPending[nextKey]) for (i = 0; i < nextKeysPending[nextKey].length; i++) {
			var pendingNextKey = nextKeysPending[nextKey][i];
			childMapping[nextKeysPending[nextKey][i]] = getValueForKey(pendingNextKey);
		}
		childMapping[nextKey] = getValueForKey(nextKey);
	}
	for (i = 0; i < pendingKeys.length; i++) childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
	return childMapping;
}
function getProp(child, prop, props) {
	return props[prop] != null ? props[prop] : child.props[prop];
}
function getInitialChildMapping(props, onExited) {
	return getChildMapping(props.children, function(child) {
		return (0, import_react.cloneElement)(child, {
			onExited: onExited.bind(null, child),
			in: true,
			appear: getProp(child, "appear", props),
			enter: getProp(child, "enter", props),
			exit: getProp(child, "exit", props)
		});
	});
}
function getNextChildMapping(nextProps, prevChildMapping, onExited) {
	var nextChildMapping = getChildMapping(nextProps.children);
	var children = mergeChildMappings(prevChildMapping, nextChildMapping);
	Object.keys(children).forEach(function(key) {
		var child = children[key];
		if (!(0, import_react.isValidElement)(child)) return;
		var hasPrev = key in prevChildMapping;
		var hasNext = key in nextChildMapping;
		var prevChild = prevChildMapping[key];
		var isLeaving = (0, import_react.isValidElement)(prevChild) && !prevChild.props.in;
		if (hasNext && (!hasPrev || isLeaving)) children[key] = (0, import_react.cloneElement)(child, {
			onExited: onExited.bind(null, child),
			in: true,
			exit: getProp(child, "exit", nextProps),
			enter: getProp(child, "enter", nextProps)
		});
		else if (!hasNext && hasPrev && !isLeaving) children[key] = (0, import_react.cloneElement)(child, { in: false });
		else if (hasNext && hasPrev && (0, import_react.isValidElement)(prevChild)) children[key] = (0, import_react.cloneElement)(child, {
			onExited: onExited.bind(null, child),
			in: prevChild.props.in,
			exit: getProp(child, "exit", nextProps),
			enter: getProp(child, "enter", nextProps)
		});
	});
	return children;
}
//#endregion
//#region node_modules/react-transition-group/esm/TransitionGroup.js
var values = Object.values || function(obj) {
	return Object.keys(obj).map(function(k) {
		return obj[k];
	});
};
var defaultProps = {
	component: "div",
	childFactory: function childFactory(child) {
		return child;
	}
};
/**
* The `<TransitionGroup>` component manages a set of transition components
* (`<Transition>` and `<CSSTransition>`) in a list. Like with the transition
* components, `<TransitionGroup>` is a state machine for managing the mounting
* and unmounting of components over time.
*
* Consider the example below. As items are removed or added to the TodoList the
* `in` prop is toggled automatically by the `<TransitionGroup>`.
*
* Note that `<TransitionGroup>`  does not define any animation behavior!
* Exactly _how_ a list item animates is up to the individual transition
* component. This means you can mix and match animations across different list
* items.
*/
var TransitionGroup = /*#__PURE__*/ function(_React$Component) {
	_inheritsLoose(TransitionGroup, _React$Component);
	function TransitionGroup(props, context) {
		var _this = _React$Component.call(this, props, context) || this;
		_this.state = {
			contextValue: { isMounting: true },
			handleExited: _this.handleExited.bind(_assertThisInitialized(_this)),
			firstRender: true
		};
		return _this;
	}
	var _proto = TransitionGroup.prototype;
	_proto.componentDidMount = function componentDidMount() {
		this.mounted = true;
		this.setState({ contextValue: { isMounting: false } });
	};
	_proto.componentWillUnmount = function componentWillUnmount() {
		this.mounted = false;
	};
	TransitionGroup.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, _ref) {
		var prevChildMapping = _ref.children, handleExited = _ref.handleExited;
		return {
			children: _ref.firstRender ? getInitialChildMapping(nextProps, handleExited) : getNextChildMapping(nextProps, prevChildMapping, handleExited),
			firstRender: false
		};
	};
	_proto.handleExited = function handleExited(child, node) {
		var currentChildMapping = getChildMapping(this.props.children);
		if (child.key in currentChildMapping) return;
		if (child.props.onExited) child.props.onExited(node);
		if (this.mounted) this.setState(function(state) {
			var children = _extends({}, state.children);
			delete children[child.key];
			return { children };
		});
	};
	_proto.render = function render() {
		var _this$props = this.props, Component = _this$props.component, childFactory = _this$props.childFactory, props = _objectWithoutPropertiesLoose(_this$props, ["component", "childFactory"]);
		var contextValue = this.state.contextValue;
		var children = values(this.state.children).map(childFactory);
		delete props.appear;
		delete props.enter;
		delete props.exit;
		if (Component === null) return /*#__PURE__*/ import_react.createElement(TransitionGroupContext_default.Provider, { value: contextValue }, children);
		return /*#__PURE__*/ import_react.createElement(TransitionGroupContext_default.Provider, { value: contextValue }, /*#__PURE__*/ import_react.createElement(Component, props, children));
	};
	return TransitionGroup;
}(import_react.Component);
TransitionGroup.propTypes = {};
TransitionGroup.defaultProps = defaultProps;
//#endregion
export { Transition as n, TransitionGroup as t };
