const camelCase = (str)=> str.replace(/-([a-z])/g, (_,l)=>l.toUpperCase());

class ElementWrapper {

  constructor(element){
    this.element = element;
  }

  attr(...args){
    const name = args[0];
    if (args.length === 1){
      if (typeof name === 'object'){
        Object.keys(name).forEach((key)=>{
          this.attr(key, name[key]);
        });
        return this;
      }

      return this.element.getAttribute(name);
    } else {
      return this.element.setAttribute(name, args[1]);
    }
  }

  css(...args){
    const prop = camelCase(args[0]);
    if (args.length === 2){
      let val = args[1];
      if (typeof val === 'number'){
        val = `${val}px`;
      }
      this.element.style[prop] = val;
      return this;
    } else {
      return this.element.style[prop];
    }
  }

  remove(){
    this.element.parentNode.removeChild(this.element);
    return this;
  }

  find(selector){
    const elements = this.element.querySelectorAll(selector);
    let result = [];
    const numElements = elements.length;
    for (let i = 0; i < numElements; i++){
      result.push(wrap(elements[i]));
    }
    return result;
  }

  findFirst(selector){
    const el = this.element.querySelector(selector);
    if (el === null){
      return null;
    } else {
      return wrap(el);
    }
  }

  append(content){
    if (typeof content === 'string'){
      this.element.innerHTML = content;
    } else if (content instanceof ElementWrapper){
      this.element.appendChild(content.element);
    } else {
      throw 'Unsupported: ' + content;
    }
    return this;
  }

  insertBefore(content){
    const element = this.element;
    const parentNode = element.parentNode;
    if (content instanceof ElementWrapper){
      parentNode.insertBefore(content.element, element);
    } else {
      throw 'Unsupported: ' + content;
    }
    return this;
  }

  update(content){
    this.element.innerHTML = '';
    this.append(content);
  }

  hide(){
    this.element.style.display = 'none';
    return this;
  }

  show(){
    this.element.style.display = 'block';
    return this;
  }

  on(eventName, selector, callback){
    const handler = createEventHandler(callback === undefined ? undefined : selector, callback === undefined ? selector : callback);
    this.element.addEventListener(eventName, handler);
    return () => this.element.removeEventListener(eventName, handler);
  }

  findParent(selector){
    let current = this.element.parentNode;
    while (current !== undefined){
      if (current.matches(selector)){
        return wrap(current);
      }
      current = current.parentNode;
    }
    return null;
  }

  closest(selector){
    if (this.element.matches(selector)){
      return this;
    } else {
      return this.findParent(selector);
    }
  }

  focus(){
    this.element.focus();
  }

  trigger(eventName, memo){
    const event = new CustomEvent(eventName, { bubbles: true, cancelable: true, detail: memo });
    const cancelled = !this.element.dispatchEvent(event);
    return !cancelled;
  }
}

class EventWrapper {

  constructor(event, memo){
    this.nativeEvent = event;
    this.memo = memo;
  }

  stop() {
    this.nativeEvent.preventDefault();
    this.nativeEvent.stopImmediatePropagation();
  }
}

const wrap = (element) => {
  if (typeof element === 'string'){
    element = document.getElementById(element);
    if (element == null){
      return null
    }
  } else if (element == null){
    throw new Error("Attempt to wrap a null DOM element")
  }
  return new ElementWrapper(element);
}

const body = wrap(document.body);

const createEventHandler = (selector, callback) => {
  return ({target})=>{
    if (selector === undefined || target.matches(selector)){
      callback.call(wrap(target));
    }
  };
};

const onevent = (elements, eventNames, match, handler) => {
  if (handler == null) {
    throw new Error('No event handler was provided.');
  }
  const wrapped = (event) => {
    const { target: element, detail: memo} = event;
    if (match != null && !element.matches(match)){
      return;
    }
    const elementWrapper = new ElementWrapper(event.target);
    const eventWrapper = new EventWrapper(event, memo);
    const result = handler.call(elementWrapper, eventWrapper, memo);
    if (result === false) {
      eventWrapper.stop();
    }
  };
  const events = eventNames.split(' ');
  elements.forEach(element=>{
    events.forEach(eventName => {
      element.addEventListener(eventName, wrapped);
    });
  });
  return () => {
    elements.forEach(element=>{
      events.forEach(eventName => {
        element.removeEventListener(eventName, wrapped);
      });
    });
  };
};

const on = (selector, events, match, handler) => {
  if (handler == null) {
    handler = match;
    match = null;
  }
  const elements = selector === window ? [window] : document.querySelectorAll(selector);
  return onevent(elements, events, match, handler);
};

const onDocument = (eventName, selector, callback) => {
  const handler = createEventHandler(callback === undefined ? undefined : selector, callback === undefined ? selector : callback);
  document.addEventListener(eventName, handler);
  return () => document.removeEventListener(eventName, handler);
};

const create = (elementName, attributes, body)=>{

  if (typeof elementName === 'object'){
    body = attributes;
    attributes = elementName;
    elementName = null;
  }

  if (typeof attributes === 'string'){
    body = attributes;
    attributes = null;
  }

  const el = wrap(document.createElement(elementName || 'div'));
  if (attributes){
    el.attr(attributes);
  }
  if (body){
    el.append(body);
  }
  return el;

};

const toSearchParams = function(data) {
  let params = new URLSearchParams();
  const keys = Object.keys(data);
  for (let i = 0; i<keys.length; i++){
    const key = keys[i];
    const val = data[key];
    if (val !== undefined){
      params.append(key, data[key]);
    }
  }
  return params;
};

let activeAjaxCount = 0;

const adjustAjaxCount = (delta) => {
  activeAjaxCount += delta;
  body.attr('data-ajax-active', activeAjaxCount);
};

const ajaxRequest = (url, {data, method = 'POST', success, contentType, failure}) => {
  let fetchOpts = {};
  let queryUrl = url;
  var headers = new Headers();
  headers.append('X-Requested-With', 'XMLHttpRequest');
  if (contentType !== undefined){
    headers.append('Content-Type', contentType);
  }
  fetchOpts.method = method;
  fetchOpts.headers = headers;
  fetchOpts.credentials = 'same-origin';
  if (data){
    if (method.toLowerCase() === 'get'){
      queryUrl = `${queryUrl}?${toSearchParams(data).toString()}`;
    } else {
      if (typeof data === 'string'){
        fetchOpts.body = data;
      } else if (contentType === 'application/json'){
        fetchOpts.body = JSON.stringify(data);
      } else {
        fetchOpts.body = toSearchParams(data);
      }
    }
  }
  adjustAjaxCount(1);
  fetch(queryUrl, fetchOpts).then((response)=>{
    adjustAjaxCount(-1);
    const {ok, headers} = response;
    const callSuccessHandler = ok && success !== undefined;
    const callFailureHander = !ok && failure !== undefined;
    if (callSuccessHandler || callFailureHander){
      const contentType = headers.get('Content-Type');
      const isJSON = contentType && contentType.indexOf('application/json') === 0;
      const resolver = (callbackArg) =>{
        if (callSuccessHandler){
          success(callbackArg);
        } else {
          failure(callbackArg);
        }
      };
      if (isJSON){
        response.json().then((json)=>{
          resolver({json: json, header: (name)=>headers.get(name)});
        });
      } else {
        response.text().then((text)=>{
          resolver({text: text, header: (name)=>headers.get(name)});
        });
      }
    }
  }).catch((reason)=>{
    adjustAjaxCount(-1);
    const message = `Request to ${url} failed -- ${reason.message}.`;
    failure({status: 0, header: ()=>undefined}, message);
  });
};

const getDataAttributeAsObject = (element, attribute) => {
  let value = element.getAttribute(`data-${attribute}`);
  if (value !== null){
    return JSON.parse(value);
  } else {
    return {};
  }
};

const getEventUrl = (eventName, element) => {
  if (!(eventName != null)) {
    throw 'dom.getEventUrl: the eventName parameter cannot be null';
  }
  if (typeof eventName !== 'string') {
    throw 'dom.getEventUrl: the eventName parameter should be a string';
  }
  eventName = eventName.toLowerCase();
  if (element === null) {
    element = document.body;
  } else if (element instanceof ElementWrapper) {
    element = element.element;
  } else if (element.jquery != null) {
    element = element[0];
  }
  let url = null;
  let data;
  while ((url == null) && (element.previousElementSibling != null)) {
    data = getDataAttributeAsObject(element, 'component-events');
    url = data != null && data[eventName] != null ? data[eventName].url : undefined;
    element = element.previousElementSibling;
  }
  if (url == null) {
    while ((url == null) && (element.parentElement != null)) {
      data = getDataAttributeAsObject(element, 'component-events');
      url = data != null && data[eventName] != null ? data[eventName].url : undefined;
      element = element.parentElement;
    }
  }
  return url;
};

let exports = wrap;
Object.assign(exports, { ElementWrapper, body, onDocument, on, getEventUrl, create, ajaxRequest });

export default exports;