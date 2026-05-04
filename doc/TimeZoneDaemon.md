# TimeZoneDaemon

The `TimeZoneDaemon` module is designed to address a limitation in Node.js where it cannot automatically detect changes to the system timezone. This daemon periodically checks the system timezone and updates the Node.js process timezone (`process.env.TZ`) to ensure they remain synchronized.

## Constructor

### **new TimeZoneDaemon(checkInterval?: number)**

Creates an instance of the `TimeZoneDaemon`.

-   **checkInterval** (optional): The interval (in milliseconds) at which the daemon checks for timezone changes. Defaults to `60000` (1 minute).

## Methods

### **stop()**

Stops the daemon from checking and updating the timezone.

```typescript
daemon.stop();
```
