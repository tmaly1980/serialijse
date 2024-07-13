import { configurePersistable, makePersistable, PersistenceStorageOptions, PersistStoreMap, ReactionOptions } from 'mobx-persist-store';
import { Storage } from '../utils/storage';
import * as serialijse from "serialijse";
import { entities } from 'database/entities';

// For justification, see: https://github.com/quarrant/mobx-persist-store/issues/55

const LOG_PERSIST = __DEV__; // eslint-disable-line @typescript-eslint/naming-convention

export const persistInitialize = (storeClasses: any[]) => {
  // Register classes for (de)serialization
  // All serializable classes should be declared in database/entities file
  
  [...storeClasses, ...entities].forEach((className: any) => {
    try {
      console.log(`[PERSIST] Declaring persistable: ${className}`); // eslint-disble-line no-console
      serialijse.declarePersistable(className);
    } catch(error) {
      console.log(`[PERSIST] Declare failed: ${className}:`, error); // eslint-disble-line no-console
    }
  })
}

// Data needs to be de-serialized back into class instances to have access to helper functions/properties
const customizedStorageController = <T>(thing: T, props: string[] = []) => {
  return {
    setItem: async (key: string, data: any): Promise<any> => {
      let encodedValue = serialijse.serialize(data)
      console.log(`[PERSIST] Setting ${key}:`, encodedValue); // eslint-disble-line no-console
      await Storage.setItem(key, encodedValue)
    },
    removeItem: async (key: string) => {
      await Storage.removeItem(key)
    },
    getItem: async (key: string): Promise<any> => {
      const encodedData = await Storage.getItem(key);
      console.log(`[PERSIST] Getting ${key}:`, encodedData); // eslint-disble-line no-console
      try {
        // TODO: Does this handle things recursively????? I hope so....
        const data: T = serialijse.deserialize<T>(encodedData);
        console.log(`[PERSIST] Value for ${key}: `, data) // eslint-disble-line no-console
        if(typeof data === 'string') {
          throw new Error("Failed to decode, had vanilla JSON")
        }
        return data;
      } catch (error) {
        console.log(`[PERSIST] Failure getting ${key}: `, error) // eslint-disble-line no-console
        // Ignore deserialization errors, resume with empty data
        return;
      }
    }
  }
};


// Workaround for RN hot reload issues with: 'makePersistable' was called with the same storage name XXXXX
export const makeReloadPersistable = <T>(thing: T, options: any) => {
  for (const [key, store] of PersistStoreMap.entries()) {
    if (store.storageName === options.name) {
      store.stopPersisting();
      PersistStoreMap.delete(key);
    }
  }

  return makePersistable(thing, 
    {
      ...options,
      storage: customizedStorageController(thing, options.properties as string[]),
      debugMode: __DEV__,
      stringify: false, // Don't call JSON.stringify first!
    },
    { fireImmediately: true }
  );
};
